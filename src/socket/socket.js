import { io } from 'socket.io-client';
import { store } from '../store/store';
import { setPlayers } from '../store/playersSlice';

//Conectamos al servidor basado en Socket.IO (debe ser el mismo puerto)
const socket = io(import.meta.env.VITE_API_URL, {
    transports: ['websocket', 'polling'],
});

//Escuchamos el evento apenas nos conectamos
socket.on('players_updated', (players) => {
    store.dispatch(setPlayers(players)); 
});

export default socket;