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
      playersPerRoom[roomId] = [];
    }

    // Agregar el jugador a la sala
    playersPerRoom[roomId].push({ id: socket.id, name, points: 0 });

    // Emitir un evento a todos los jugadores en la sala
    io.to(roomId).emit('players_updated', playersPerRoom[roomId]);
  });

  socket.on('start_game', (roomId) => {
    console.log(`El host ha iniciado la partida en la sala: ${roomId}`);
    const letter = pickAndPushLetter(roomId, letterHistoryPerRoom);
    currentLetterPerRoom[roomId] = letter;
    console.log(`Letra inicial: ${letter}`);
    io.to(roomId).emit('navigate_to_game');
    io.to(roomId).emit('start_new_round', {letter});
    io.to(roomId).emit('players_updated', playersPerRoom[roomId]);
  });

  socket.on('change_phase', ({ roomId, phase }) => {
    io.to(roomId).emit('phase_updated', phase);
  });

  socket.on('navigate_to_score', ({ roomId }) => {
  io.to(roomId).emit('navigate_to_score');
  });

  //Evento para actualizar puntos de un jugador
  socket.on('update_points', ({ roomId, playerId, points }) => {
    console.log('Backend recibe:', { roomId, playerId, points });
    if(!playersPerRoom[roomId]) return;
    
    const player = playersPerRoom[roomId].find(p => p.id === playerId);
    if (player) {
      player.points += points;
    } else {
      console.log('Jugador no encontrado:');
    }

    io.to(roomId).emit('players_updated', playersPerRoom[roomId]);  
  });

  socket.on('new_round', ({ roomId }) => {
    const letter = pickAndPushLetter(roomId, letterHistoryPerRoom);
    console.log(`Enviando letra: ${letter}`);
    currentLetterPerRoom[roomId] = letter;
    io.to(roomId).emit('start_new_round', { letter });
    io.to(roomId).emit('players_updated', playersPerRoom[roomId]);
  });

  socket.on('end_game', ({ roomId }) => {
    if(playersPerRoom[roomId]) {
      playersPerRoom[roomId].forEach(p => p.points = 0);
    }
    io.to(roomId).emit('players_updated', playersPerRoom[roomId]);
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