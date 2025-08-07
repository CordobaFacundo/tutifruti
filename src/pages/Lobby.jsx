import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setPlayers } from '../store/playersSlice';
import socket from '../socket/socket';

export const Lobby = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomId } = useParams(); // Obtenemos el roomId de la URL
  const { userName, isHost, userId } = useSelector((state) => state.user);
  const players = useSelector((state) => state.players.players);

  const handleStart = () => {
    socket.emit('start_game', roomId);
  }

  useEffect(() => {
    socket.on('navigate_to_game', () => {
      navigate(`/sala/${roomId}/game`);
    });
  
    return () => {
      socket.off('navigate_to_game'); // Limpiamos el listener al desmontar
    }
  }, [])
  

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <div className="bg-dark p-4 rounded shadow text-white">
          <h2 className="text-center mb-4">Lobby</h2>
          <p className="text-center">Hola wachin, <strong>{userName}</strong> 👋</p>
          <p>{isHost ? 'Sos el host' : 'Esperando que el host inicie la partida'}</p>

          <div className="mb-4">
            <h5>Jugadores en la sala:</h5>
            <ul className="list-group">
              {players.map((player) => (
                <li
                  key={player.id}
                  className={`list-group-item ${player.id === userId ? 'list-group-item-success' : ''
                    }`}
                >
                  {player.name} {player.id === userId ? '(vos)' : ''}
                </li>
              ))}
            </ul>
          </div>

          {isHost && (
            <button className="btn btn-success w-100" onClick={handleStart}>
              Iniciar partida
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
