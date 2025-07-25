import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updatePlayerPoints } from '../store/playersSlice';
import { Navbar } from '../components/Navbar';
import { toast } from 'react-toastify';
import { setPhase, generateLetter } from '../store/gameSlice';

export const Game = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams(); // Obtenemos el roomId de la URL
  
  const userName = useSelector((state) => state.user.userName);
  const isHost = useSelector((state) => state.user.isHost);
  const phase = useSelector((state) => state.game.phase);
  const currentLetter = useSelector((state) => state.game.currentLetter);
  const letterHistory = useSelector((state) => state.game.letterHistory);

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
  const [timeLeft, setTimeLeft] = useState(60); // Tiempo inicial de 60 segundos

  const handleInputChange = (index, value) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = value;
    setRespuestas(nuevasRespuestas);
  };

  const handlePoints = (index, cant) => {
    if (pointsFields[index]) return; // Evita score más de una vez
    setPoints(points + cant);

    const newPointsFields = [...pointsFields];
    newPointsFields[index] = true; // Marca el campo como puntuado
    setPointsFields(newPointsFields);
  }

  const handleScore = () => {
    dispatch(updatePlayerPoints({ name: userName, points }));
    navigate(`/sala/${roomId}/score`);
  }
  
  // Simula la obtención de una letra aleatoria
  useEffect(() => {
    if (phase === 'play' && currentLetter === '') {
      dispatch(generateLetter()); // Genera una nueva letra
    }
  }, [phase, currentLetter]);
  
  // Temporizador
  useEffect(() => {
    if( phase !== 'play') return; // No iniciar el temporizador si no estamos en la phase de play

    setTimeLeft(60); // Reinicia el tiempo al iniciar la phase de play

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.info('⏰ ¡Se acabó el tiempo!', {
            position: "top-center",
            autoClose: 3000,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Limpia el temporizador al desmontar el componente
  }, [phase]);

  useEffect(() => {
    if(timeLeft === 0 && phase === 'play') {
      dispatch(setPhase('score'));
    }
  }, [timeLeft, phase, dispatch]);

  return (
    <div className="container py-4">
      <Navbar currentLetter={currentLetter} points={points} timeLeft={timeLeft} />

      {/* CAMPOS DEL JUEGO */}
      {campos.map((campo, index) => (
        <div key={index} className="mb-3">
          <label className="form-label">{campo}</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder={`Escribi un ${campo.toLowerCase()}`}
            disabled={phase === 'score'}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />

          {phase === 'score' && (
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

      {isHost && (
        phase === 'play' ? (
        <button
          className="btn btn-primary w-100"
          onClick={() => dispatch(setPhase('score')) }
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
      ))}
    </div>
  );
};
