import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetAllPoints } from '../store/playersSlice';
import { resetPointsUser } from '../store/userSlice';
import { incrementRound, resetGame, setCurrentLetter, setPhase } from '../store/gameSlice';

export const Score = () => {

  const players = useSelector((state) => state.players.players);
  const isHost = useSelector((state) => state.user.isHost);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleNewRound = () => {
    dispatch(setPhase('play'));
    dispatch(setCurrentLetter('')); 
    dispatch(incrementRound()); 
    navigate('/game');
  };

  const handleFinalizeGame = () => {
    dispatch(resetAllPoints());
    dispatch(resetPointsUser());
    dispatch(resetGame());
    navigate('/lobby');
  }

  const sorted = [...players].sort((a, b) => b.points - a.points);

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
