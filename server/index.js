const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { pickAndPushLetter } = require('./utils/letterGenerator');
const { rooms } = require('./roomStore');
const { registerRoomEvents } = require('./socket/roomEvents');
const { 
  clearPlayersResponses,
  getPlayerFromRoom,
  clearRoomTimer,
  findRoomIdBySocketId,
  removePlayerFromRoom,
  reassignHostIfNeeded,
  isRoomEmpty,
  getSanitizedPlayers,
} = require('./utils/roomUtils');


//Configurar servidor Express
const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.get('/', (_req, res) => {
  res.status(200).send('Tutifruti futbolero backend OK 🚀');
});

const server = http.createServer(app);

//Inicializar Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


//Evento de conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Un jugador se conectó:', socket.id);

  registerRoomEvents({ io, socket, rooms });

  const removePlayerAndNotifyRoom = (roomId, reason) => {
    const room = rooms[roomId];
    if (!room) return false;

    const removedPlayer = removePlayerFromRoom(room, socket.id);

    if (!removedPlayer) return false;

    console.log(
      `Jugador ${removedPlayer.name} eliminado de la sala ${roomId} (${reason})`
    );

    const previousHostId = room.hostId;
    const newHostId = reassignHostIfNeeded(room);

    if (isRoomEmpty(room)) {
      console.log(`La sala ${roomId} esta vacia. Eliminando sala.`);

      clearRoomTimer(room);
      delete rooms[roomId];

      return true;
    }

    if (previousHostId !== newHostId && newHostId) {
      console.log(`Host reasignado en sala ${roomId}: ${newHostId}`);
      io.to(newHostId).emit('host_assigned', { roomId, hostId: newHostId });
    }

    io.to(roomId).emit('players_updated', getSanitizedPlayers(room));

    return true;
  };


  socket.on('start_game', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.hostId !== socket.id) {
      console.log(`⛔ ${socket.id} intentó iniciar la partida sin ser host`);
      return;
    }

    const letter = pickAndPushLetter(room.letterHistory);
    room.currentLetter = letter;
    room.phase = 'play';
    clearPlayersResponses(room);

    console.log(`▶️ Partida iniciada en sala ${roomId} con letra ${letter}`);

    //Limpiar timer por si acaso
    if (room.timer.timeoutId) {
      clearTimeout(room.timer.timeoutId);
      room.timer.timeoutId = null;
    }

    //Calcular cuando termina el tiempo y guardar en la sala
    room.timer.endsAt = Date.now() + room.timer.duration * 1000;

    //El servidor es quien termina la ronda cuando se acaba el tiempo
    room.timer.timeoutId = setTimeout(() => {
      console.log(`⏰ Tiempo terminado para la sala ${roomId}`);
      io.to(roomId).emit('force_end_play');
    }, room.timer.duration * 1000);


    
    io.to(roomId).emit('navigate_to_game');
    io.to(roomId).emit('round_timer_started', { endsAt: room.timer.endsAt });
    io.to(roomId).emit('start_new_round', {letter});
    io.to(roomId).emit('players_updated', getSanitizedPlayers(room));
  });

  socket.on('send_responses', ({ roomId, playerId, respuestas }) => {
    console.log(`📩 Respuestas recibidas de ${playerId} en sala ${roomId}:`, respuestas);

    const room = rooms[roomId];
    if (!room) return;

    if (playerId !== socket.id) {
      console.log(`⛔ ${socket.id} intentó enviar respuestas por ${playerId}`);
      return;
    }

    const player = getPlayerFromRoom(room, playerId);
    if (!player) {
      console.log(`⛔ Jugador ${playerId} no encontrado en sala ${roomId}`);
      return;
    }

    player.responses = respuestas;
    io.to(roomId).emit('all_responses', room.players);
    
  });

  socket.on('change_phase', ({ roomId, phase }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.phase = phase;
    io.to(roomId).emit('phase_updated', phase);
  });

  socket.on('force_end_play', (roomId) => {
    console.log('Se recibio force_end_play en la sala:', roomId);
    const room = rooms[roomId];
    if (!room) return;

    clearTimeout(room.timer.timeoutId);
    room.phase = 'score';

    io.to(roomId).emit('force_end_play');
  });

  socket.on('navigate_to_score', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.hostId !== socket.id) {
      console.log(`⛔ ${socket.id} intentó navegar a score sin ser host`);
      return;
    }

    io.to(roomId).emit('navigate_to_score');
  });

  //Evento para actualizar puntos de un jugador
  socket.on('update_points', ({ roomId, playerId, points }) => {
    console.log('Backend recibe:', { roomId, playerId, points });

    const room = rooms[roomId];
    if (!room) return;

    if (playerId !== socket.id) {
      console.log(`⛔ ${socket.id} intentó sumar puntos por ${playerId}`);
      return;
    }
    
    const player = getPlayerFromRoom(room, playerId);

    if (!player) {
      console.log('Jugador no encontrado:');
      return;
    }

    player.points += points;
    io.to(roomId).emit('players_updated', getSanitizedPlayers(room));  
  });

  socket.on('new_round', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.hostId !== socket.id) {
      console.log(`⛔ ${socket.id} intentó iniciar nueva ronda sin ser host`);
      return;
    }

    const letter = pickAndPushLetter(room.letterHistory);
    room.currentLetter = letter;
    room.phase = 'play';
    clearPlayersResponses(room);

    clearRoomTimer(room);
    room.timer.endsAt = Date.now() + room.timer.duration * 1000;

    room.timer.timeoutId = setTimeout(() => {
      console.log(`⏰ Tiempo terminado para la sala ${roomId}`);
      io.to(roomId).emit('force_end_play');
    }, room.timer.duration * 1000);

  
    io.to(roomId).emit('start_new_round', { letter });
    io.to(roomId).emit('round_timer_started', { endsAt: room.timer.endsAt });
    io.to(roomId).emit('players_updated', getSanitizedPlayers(room));
  });

  socket.on('get_timer', (roomId, cb) => {
    const room = rooms[roomId];

    if (room && room.timer.endsAt) {
      cb({ endsAt: room.timer.endsAt });
    } else {
      cb(null);
    }
  });

  socket.on('end_game', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.hostId !== socket.id) {
      console.log(`⛔ ${socket.id} intentó obtener el timer sin ser host`);
      return;
    }

    room.players.forEach((player) => {
      player.points = 0;
      delete player.responses;
    });

    room.phase = 'lobby';
    clearRoomTimer(room);

    room.currentLetter = '';
    room.letterHistory = [];

    io.to(roomId).emit('players_updated', getSanitizedPlayers(room));
    io.to(roomId).emit('end_game');
  });

  socket.on('get_current_letter', (roomId, cb) => {
    const room = rooms[roomId];
    cb(room?.currentLetter || '');
  });

  socket.on('leave_room', ({ roomId }) => {
    const normalizedRoomId = String(roomId || '').trim();

    if (!normalizedRoomId) return;

    socket.leave(normalizedRoomId);
    removePlayerAndNotifyRoom(normalizedRoomId, 'abandono voluntario');
  });

  //Evento para cuando se desconecta un jugador
  socket.on('disconnect', () => {
    console.log('❌ Jugador desconectado:', socket.id);

    const roomId = findRoomIdBySocketId(rooms, socket.id);
    if (!roomId) return;

    removePlayerAndNotifyRoom(roomId, 'desconexion');

  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
