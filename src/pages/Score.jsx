import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setPlayers } from '../store/playersSlice';
import { resetPointsUser } from '../store/userSlice';
import { incrementRound, resetGame, setCurrentLetter, setPhase } from '../store/gameSlice';
import { useEffect } from 'react';
import socket from '../socket/socket';

export const Score = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const players = useSelector((state) => state.players.players);
  const isHost = useSelector((state) => state.user.isHost);

  if(!players.length) {
    return <div className='alert alert-info'>Cargando jugadores...</div>;
  }

  useEffect(() => {
    socket.on('start_new_round', () => {
      dispatch(setPhase('play'));
      dispatch(setCurrentLetter(''));
      dispatch(incrementRound());
      navigate(`/sala/${roomId}/game`);
    });

    return () => {
      socket.off('start_new_round');
    }
  }, [dispatch, navigate, roomId]);

  useEffect(() => {
    socket.on('end_game', () => {
      dispatch(resetPointsUser && resetPointsUser());
      dispatch(resetGame && resetGame());
      navigate(`/sala/${roomId}/lobby`);
    })

    return () => {
      socket.off('end_game');
    }
  }, [dispatch, navigate, roomId]);


  const handleNewRound = () => {
    socket.emit('new_round', { roomId });
  };

  const handleFinalizeGame = () => {
    socket.emit('end_game', { roomId });
  }
  
  const sorted = [...players].sort((a, b) => b.points - a.points);
  console.log('Jugadores en Score:', players);

  return (
    <div className="container text-center mt-5">
      <h2 className="mb-4">🏆 Tabla de posiciones</h2>
      <ul className="list-group mb-4">
        {sorted.map((player, index) => (
          <li
            key={player.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              {index === 0 && '🥇 '}
              {index === 1 && '🥈 '}
              {index === 2 && '🥉 '}
              {player.name}
            </div>
            <span className="badge bg-primary rounded-pill">{player.points} pts</span>
          </li>
        ))}
      </ul>

      {isHost && (
        <div className='text-center'>
          <button className="btn btn-primary mt-3" onClick={handleNewRound}>
            🔄 Jugar otra ronda
          </button>
          <button className='btn btn-primary mt-3 ms-2' onClick={handleFinalizeGame}>
            Finalizar partida
          </button>
        </div>
      )}


    </div>
  );
};
