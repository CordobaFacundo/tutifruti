import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const Lobby = () => {

  const navigate = useNavigate();
  const {userName, isHost} = useSelector((state) => state.user);

  const handleStart = () => {
    navigate('/game');
  }

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
              <li className="list-group-item list-group-item-success">{userName} (vos)</li>
              {/* Más adelante, acá se agregan los demás jugadores */}
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
