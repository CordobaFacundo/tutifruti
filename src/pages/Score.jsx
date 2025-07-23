import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetAllPoints, updatePlayerPoints } from '../store/playersSlice';
import { useEffect } from 'react';
import { resetPointsUser } from '../store/userSlice';

export const Score = () => {

  const playerPoints = useSelector((state) => state.user.points);
  const players = useSelector((state) => state.players.players);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleNewRound = () => {
    navigate('/lobby');
  };

  const handleFinalizeGame = () => {
    dispatch(resetAllPoints());
    dispatch(resetPointsUser());
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

      <div className='text-center'>
        <button className="btn btn-primary mt-3" onClick={handleNewRound}>
          🔄 Jugar otra ronda
        </button>
        <button className='btn btn-primary mt-3 ms-2' onClick={handleFinalizeGame}>
          Finalizar partida 
        </button>
      </div>

    </div>
  );
};
