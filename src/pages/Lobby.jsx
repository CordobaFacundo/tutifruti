import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../socket/socket';
import { setPlayers } from '../store/playersSlice';
import { clearRoomId } from '../store/roomSlice';
import { clearUser, setIsHost } from '../store/userSlice';

export const Lobby = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const { userName, isHost, userId } = useSelector((state) => state.user);
  const players = useSelector((state) => state.players.players);

  const handleStart = () => {
    socket.emit('start_game', roomId);
  }

  const leaveRoom = () => {
    dispatch(clearUser());
    dispatch(clearRoomId());
    dispatch(setPlayers([]));
    navigate('/room-access', { replace: true });
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', { roomId });
    leaveRoom();
  };

  useEffect(() => {
    const handleNavigateToGame = () => {
      navigate(`/sala/${roomId}/game`);
    };

    const handleHostAssigned = ({ hostId }) => {
      dispatch(setIsHost(hostId === userId));
    };

    socket.on('navigate_to_game', handleNavigateToGame);
    socket.on('host_assigned', handleHostAssigned);
  
    return () => {
      socket.off('navigate_to_game', handleNavigateToGame);
      socket.off('host_assigned', handleHostAssigned);
    }
  }, [dispatch, navigate, roomId, userId]);
  

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <div className="bg-dark p-4 rounded shadow text-white">
          <h2 className="text-center mb-4">Lobby</h2>
          <p className="text-center text-secondary mb-2">
            Codigo de sala: <strong className="text-white">{roomId}</strong>
          </p>
          <p className="text-center">Hola wachin, <strong>{userName}</strong> 👋</p>
          <p>{isHost ? 'Sos el host de esta sala' : 'Esperando que el host inicie la partida'}</p>

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
            <button className="btn btn-success w-100 mb-2" onClick={handleStart}>
              Iniciar partida
            </button>
          )}

          <button className="btn btn-danger w-100" onClick={handleLeaveRoom}>
            abandonar sala
          </button>
        </div>
      </div>
    </div>
  )
}
