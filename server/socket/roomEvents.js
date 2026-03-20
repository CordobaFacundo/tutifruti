const {
  generateRoomId,
  createRoom,
  getRoom,
  getPlayerFromRoom,
  isPlayerNameTaken,
  addPlayerToRoom,
  getSanitizedPlayers,
} = require('../utils/roomUtils');

const registerRoomEvents = ({ io, socket, rooms }) => {
  socket.on('create-room', () => {
    try {
      const roomId = generateRoomId(rooms);
      rooms[roomId] = createRoom(roomId, socket.id);

      console.log(`🏠 Sala creada: ${roomId} | host provisional: ${socket.id}`);

      socket.emit('room-created', { roomId });
    } catch (error) {
      console.error('Error al crear sala:', error);
      socket.emit('room-error', {
        message: 'No se pudo crear la sala. Probá de nuevo.',
      });
    }
  });

  socket.on('validate-room', ({ roomId }) => {
    const normalizedRoomId = String(roomId || '').trim();

    if (!/^\d{4}$/.test(normalizedRoomId)) {
      socket.emit('room-error', {
        message: 'El código de sala debe tener 4 dígitos.',
      });
      return;
    }

    const room = getRoom(rooms, normalizedRoomId);

    if (!room) {
      socket.emit('room-error', {
        message: 'La sala no existe.',
      });
      return;
    }

    socket.emit('room-validated', { roomId: normalizedRoomId });
  });

  socket.on('join_room', ({ roomId, name }) => {
    const normalizedRoomId = String(roomId || '').trim();
    const normalizedName = String(name || '').trim();

    if (!normalizedRoomId) {
      socket.emit('room-error', { message: 'Falta el código de sala.' });
      return;
    }

    if (!normalizedName) {
      socket.emit('room-error', { message: 'Ingresá un nombre válido.' });
      return;
    }

    const room = getRoom(rooms, normalizedRoomId);

    if (!room) {
      socket.emit('room-error', { message: 'La sala no existe.' });
      return;
    }

    if (isPlayerNameTaken(room, normalizedName)) {
      socket.emit('room-error', {
        message: 'Ese nombre ya está en uso dentro de la sala.',
      });
      return;
    }

    const existingPlayer = getPlayerFromRoom(room, socket.id);
    if (existingPlayer) {
      socket.emit('room-joined', {
        roomId: normalizedRoomId,
        user: {
          id: existingPlayer.id,
          name: existingPlayer.name,
          isHost: existingPlayer.isHost,
        },
      });
      return;
    }

    socket.join(normalizedRoomId);

    const isHost = room.hostId === socket.id;

    const player = {
      id: socket.id,
      name: normalizedName,
      points: 0,
      isHost,
    };

    addPlayerToRoom(room, player);

    console.log(
      `👤 ${normalizedName} (${socket.id}) se unió a la sala ${normalizedRoomId} | host: ${isHost}`
    );

    socket.emit('room-joined', {
      roomId: normalizedRoomId,
      user: {
        id: player.id,
        name: player.name,
        isHost: player.isHost,
      },
    });

    io.to(normalizedRoomId).emit('players_updated', getSanitizedPlayers(room));
  });
};

module.exports = { registerRoomEvents };