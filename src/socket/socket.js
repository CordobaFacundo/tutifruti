import { io } from 'socket.io-client';

//Conectamos al servidor basado en Socket.IO (debe ser el mismo puerto)
const socket = io('http://localhost:3001');

export default socket;