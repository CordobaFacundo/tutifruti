import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserPoints } from '../store/userSlice';

export const Game = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [fase, setFase] = useState('jugar'); // 'jugar' o 'puntuar'
  const campos = [
    'Jugador argentino',
    'Jugador retirado',
    'Jugador actual',
    'Selección nacional',
    'Club',
    'Ganador de Champions League',
    'Ganador del Mundial',
  ];
  const [respuestas, setRespuestas] = useState(Array(campos.length).fill(''));
  const [points, setPoints] = useState(0);
  const [pointsFields, setPointsFields] = useState(Array(campos.length).fill(false));

  const handleInputChange = (index, value) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = value;
    setRespuestas(nuevasRespuestas);
  };

  const handlePoints = (index, cant) => {
    if (pointsFields[index]) return; // Evita puntuar más de una vez
    setPoints(points + cant);

    const newPointsFields = [...pointsFields];
    newPointsFields[index] = true; // Marca el campo como puntuado
    setPointsFields(newPointsFields);
  }

  const handleScore = () => {
    navigate('/score');
    dispatch(setUserPoints(points));
  }

  return (
    <div className="container py-4">
      {/* NAVBAR SUPERIOR SIMPLIFICADA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><strong>Tiempo:</strong> --:--</div>
        <div><strong>Letra:</strong> A</div>
        <div><strong>Puntaje:</strong> {points} </div>
      </div>

      {/* CAMPOS DEL JUEGO */}
      {campos.map((campo, index) => (
        <div key={index} className="mb-3">
          <label className="form-label">{campo}</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder={`Escribi un ${campo.toLowerCase()}`}
            disabled={fase === 'puntuar'}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />

          {fase === 'puntuar' && (
            <div className="btn-group">
              <button
                className={"btn btn-success mx-2"}
                onClick={() => handlePoints(index, 10)}
                disabled={respuestas[index].trim().length <= 1 || pointsFields[index]}
              >
                +10
              </button>
              <button
                className={"btn btn-warning mx-2"}
                onClick={() => handlePoints(index, 5)}
                disabled={respuestas[index].trim().length <= 1 || pointsFields[index]}
              >
                +5
              </button>
              <button
                className={"btn btn-danger mx-2"}
                onClick={() => handlePoints(index, 0)}
              >
                0
              </button>
            </div>
          )}
        </div>
      ))}

      {fase === 'jugar' ? (
        <button
          className="btn btn-primary w-100"
          onClick={() => setFase('puntuar')}
        >
          Ver puntajes
        </button>
      ) : (
        <button
          className="btn btn-success w-100"
          onClick={handleScore}
        >
          Finalizar ronda
        </button>
      )}

    </div>
  );
};
