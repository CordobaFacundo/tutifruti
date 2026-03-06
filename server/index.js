const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { pickAndPushLetter } = require('./utils/letterGenerator');

//Configurar servidor Express
const app = express();
app.use(cors()); //Permitir acceso desde otros origenes

const server = http.createServer(app);

//Inicializar Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir todas las conexiones
    methods: ['GET', 'POST']
  }
});

const playersPerRoom = {}; 
const letterHistoryPerRoom = {}; 
const currentLetterPerRoom = {};

//Evento de conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Un jugador se conectó:', socket.id);

  // Evento para unirse a una sala
  socket.on('join_room', ({roomId, name}) => {
    socket.join(roomId);
    console.log(`${name} (${socket.id}) se unió a la sala: ${roomId}`);

    //Aseguramos que exista la sala
    if (!playersPerRoom[roomId]) {
      playersPerRoom[roomId] = {
        players: [],
        timer: {
          timeoutId: null,
          endsAt: null,
          duration: 90
        }
      };
    }

    const exists = playersPerRoom[roomId].players.some(p => p.id === socket.id);
    if (!exists) {
      playersPerRoom[roomId].players.push({ id: socket.id, name, points: 0 });
    }

    // Emitir un evento a todos los jugadores en la sala
    io.to(roomId).emit('players_updated', playersPerRoom[roomId].players);
  });

  socket.on('start_game', (roomId) => {
    const room = playersPerRoom[roomId];
    if (!room) return;

    const letter = pickAndPushLetter(roomId, letterHistoryPerRoom);
    currentLetterPerRoom[roomId] = letter;
    console.log(`Letra inicial: ${letter}`);

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
    io.to(roomId).emit('players_updated', room.players);
  });

  socket.on('send_responses', ({ roomId, playerId, respuestas }) => {
    console.log(`📩 Respuestas recibidas de ${playerId} en sala ${roomId}:`, respuestas);
    
    if(!playersPerRoom[roomId]) return;

    const player = playersPerRoom[roomId].players.find(p => p.id === playerId);
    if(player) {
      player.responses = respuestas;
      io.to(roomId).emit('all_responses', playersPerRoom[roomId].players);
    } else {
      console.log(`Jugador ${playerId} no encontrado en la sala ${roomId}`);
      return;
    }
  });

  socket.on('change_phase', ({ roomId, phase }) => {
    io.to(roomId).emit('phase_updated', phase);
  });

  socket.on('force_end_play', (roomId) => {
    console.log('Se recibio force_end_play en la sala:', roomId);
    const room = playersPerRoom[roomId];
    if (!room) return;

    //Cancelar el timer del servidor si todavía está activo ( caso STOP )
    if (room.timer.timeoutId) {
      clearTimeout(room.timer.timeoutId);
      room.timer.timeoutId = null;
    }
    room.timer.endsAt = null;

    io.to(roomId).emit('force_end_play');
  });

  socket.on('navigate_to_score', ({ roomId }) => {
  io.to(roomId).emit('navigate_to_score');
  });

  //Evento para actualizar puntos de un jugador
  socket.on('update_points', ({ roomId, playerId, points }) => {
    console.log('Backend recibe:', { roomId, playerId, points });
    if(!playersPerRoom[roomId]) return;
    
    const player = playersPerRoom[roomId].players.find(p => p.id === playerId);
    if (player) {
      player.points += points;
    } else {
      console.log('Jugador no encontrado:');
    }

    io.to(roomId).emit('players_updated', playersPerRoom[roomId].players);  
  });

  socket.on('new_round', ({ roomId }) => {
    const room = playersPerRoom[roomId];
    if (!room) return;

    const letter = pickAndPushLetter(roomId, letterHistoryPerRoom);
    currentLetterPerRoom[roomId] = letter;

    //Limpiar timer por si acaso
    if (room.timer.timeoutId) {
      clearTimeout(room.timer.timeoutId);
      room.timer.timeoutId = null;
    }

    room.timer.endsAt = Date.now() + room.timer.duration * 1000;

    room.timer.timeoutId = setTimeout(() => {
      console.log(`⏰ Tiempo terminado para la sala ${roomId}`);
      io.to(roomId).emit('force_end_play');
    }, room.timer.duration * 1000);

  
    io.to(roomId).emit('start_new_round', { letter });
    io.to(roomId).emit('round_timer_started', { endsAt: room.timer.endsAt });
    io.to(roomId).emit('players_updated', room.players);
  });

  socket.on('get_timer', (roomId, cb) => {
    const room = playersPerRoom[roomId];
    if (room && room.timer.endsAt) {
      cb({ endsAt: room.timer.endsAt });
    } else {
      cb(null);
    }
  });

  socket.on('end_game', ({ roomId }) => {
    if(playersPerRoom[roomId]) {
      playersPerRoom[roomId].players.forEach(p => p.points = 0);
    }
    io.to(roomId).emit('players_updated', playersPerRoom[roomId].players);
    io.to(roomId).emit('end_game');
  });

  socket.on('get_current_letter', (roomId, cb) => {
    cb(currentLetterPerRoom[roomId] || '');
  })

  //Evento para cuando se desconecta un jugador
  socket.on('disconnect', () => {
    console.log('❌ Jugador desconectado:', socket.id);
    //Vamos a limpiar
  });
});

//Levantar el servidor en el puerto 3001
server.listen(3001, () => {
  console.log('🚀 Servidor escuchando en http://localhost:3001');
});