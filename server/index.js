const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

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

//Evento de conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Un jugador se conectó:', socket.id);

  //Evento para cuando se desconecta un jugador
  socket.on('disconnect', () => {
    console.log('❌ Jugador desconectado:', socket.id);
  });
});

//Levantar el servidor en el puerto 3001
server.listen(3001, () => {
  console.log('🚀 Servidor escuchando en http://localhost:3001');
});