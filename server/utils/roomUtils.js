const generateRoomId = (rooms) => {
  let roomId = '';
  let attempts = 0;

  do {
    roomId = Math.floor(1000 + Math.random() * 9000).toString();
    attempts += 1;
  } while (rooms[roomId] && attempts < 10000);

  if (rooms[roomId]) {
    throw new Error('No se pudo generar un código de sala único');
  }

  return roomId;
};

const createRoom = (roomId, hostSocketId) => {
  return {
    roomId,
    hostId: hostSocketId,
    phase: 'lobby',
    players: [],
    timer: {
      timeoutId: null,
      endsAt: null,
      duration: 90,
    },
  };
};

const getRoom = (rooms, roomId) => rooms[roomId] || null;

const normalizeName = (name = '') => name.trim().toLowerCase();

const getPlayerFromRoom = (room, socketId) => {
  if (!room) return null;
  return room.players.find((player) => player.id === socketId) || null;
};

const isPlayerNameTaken = (room, name) => {
  if (!room) return false;
  const normalizedName = normalizeName(name);

  return room.players.some(
    (player) => normalizeName(player.name) === normalizedName
  );
};

const addPlayerToRoom = (room, player) => {
  if (!room) return null;

  room.players.push(player);
  return player;
};

const removePlayerFromRoom = (room, socketId) => {
  if (!room) return null;

  const playerIndex = room.players.findIndex((player) => player.id === socketId);

  if (playerIndex === -1) return null;

  const [removedPlayer] = room.players.splice(playerIndex, 1);
  return removedPlayer;
};

const getSanitizedPlayers = (room) => {
  if (!room) return [];

  return room.players.map((player) => ({
    id: player.id,
    name: player.name,
    points: player.points,
    isHost: player.isHost,
  }));
};

const reassignHostIfNeeded = (room) => {
  if (!room) return null;

  const currentHostStillInRoom = room.players.some(
    (player) => player.id === room.hostId
  );

  if (currentHostStillInRoom) {
    room.players.forEach((player) => {
      player.isHost = player.id === room.hostId;
    });
    return room.hostId;
  }

  if (room.players.length === 0) {
    room.hostId = null;
    return null;
  }

  const newHost = room.players[0];
  room.hostId = newHost.id;

  room.players.forEach((player) => {
    player.isHost = player.id === room.hostId;
  });

  return room.hostId;
};

const isRoomEmpty = (room) => !room || room.players.length === 0;

const clearRoomTimer = (room) => {
  if (!room || !room.timer) return;

  if (room.timer.timeoutId) {
    clearTimeout(room.timer.timeoutId);
    room.timer.timeoutId = null;
  }

  room.timer.endsAt = null;
};

const clearPlayersResponses = (room) => {
  if (!room) return;

  room.players.forEach((player) => {
    delete player.responses;
  });
};

const findRoomIdBySocketId = (rooms, socketId) => {
  for (const roomId of Object.keys(rooms)) {
    const room = rooms[roomId];

    const isHostOwner = room.hostId === socketId;
    const isPlayerInside = room.players.some((player) => player.id === socketId);

    if (isHostOwner || isPlayerInside) {
      return roomId;
    }
  }

  return null;
};

module.exports = {
  generateRoomId,
  createRoom,
  getRoom,
  getPlayerFromRoom,
  isPlayerNameTaken,
  addPlayerToRoom,
  removePlayerFromRoom,
  getSanitizedPlayers,
  reassignHostIfNeeded,
  isRoomEmpty,
  clearRoomTimer,
  clearPlayersResponses,
  findRoomIdBySocketId,
};
