import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { toast } from 'react-toastify';
import { setPhase, setCurrentLetter } from '../store/gameSlice';
import socket from '../socket/socket';

export const Game = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams(); // Obtenemos el roomId de la URL

  const { isHost, userId } = useSelector((state) => state.user);
  const { phase, currentLetter } = useSelector((state) => state.game);

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
  const [hasSentPoints, setHasSentPoints] = useState(false);

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

  //Sincronizar fase para todos cuando cualquier jugador termine
  const handleEndPlay = () => {
    socket.emit('change_phase', { roomId, phase: 'score' });
  }

  const handleScore = () => {
    socket.emit('navigate_to_score', { roomId });
  }

  const handleSendPoints = () => {
    socket.emit('update_points', { roomId, playerId: userId, points });
    setHasSentPoints(true);
  }


  //SECTOR DE LOS USEFFECTS

  // Escucha el evento de nueva letra desde el servidor
  useEffect(() => {
    socket.on('start_new_round', ({ letter }) => {
      console.log('Letra recibida del servidor:', letter);
      dispatch(setCurrentLetter(letter));
      dispatch(setPhase('play'));
      setRespuestas(Array(campos.length).fill(''));
      setPoints(0);
      setPointsFields(Array(campos.length).fill(false));
      setHasSentPoints(false);
      setTimeLeft(60);
    });

    return () => {
      socket.off('start_new_round');
    };
  }, [dispatch]);

  // Escucha el evento de cambio de fase desde el servidor
  useEffect(() => {
    socket.on('phase_updated', (newPhase) => {
      dispatch(setPhase(newPhase));
    })

    return () => {
      socket.off('phase_updated');
    }
  }, [dispatch])

  //Escucha el evento de navegación a score
  useEffect(() => {
    socket.on('navigate_to_score', () => {
      navigate(`/sala/${roomId}/score`);
    });

    return () => {
      socket.off('navigate_to_score');
    }
  }, [navigate, roomId]);


  // Temporizador
  useEffect(() => {
    if (phase !== 'play') return; // No iniciar el temporizador si no estamos en la phase de play

    //setTimeLeft(60); // Reinicia el tiempo al iniciar la phase de play

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.info('⏰ ¡Se acabó el tiempo!', {
            position: "top-center",
            autoClose: 3000,
          });
          //Cuando termina el tiempo, todos los jugadores pasan a la phase de score
          socket.emit('change_phase', { roomId, phase: 'score' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Limpia el temporizador al desmontar el componente
  }, [phase, roomId]);

  useEffect(() => {
    if(!currentLetter) {
      socket.emit('get_current_letter', roomId, (letter) => {
        if(letter) {
          dispatch(setCurrentLetter(letter));
        }
      });
    }
  
  }, [currentLetter, dispatch, roomId]);
  

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
                disabled={pointsFields[index]}
              >
                0
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Cualquier jugador puede terminar el tiempo y pasar a score */}
      {phase === 'play' && (
        <button
          className='btn btn-primary w-100'
          onClick={handleEndPlay}
        >
          Terminar
        </button>
      )}

      {phase === 'score' && !hasSentPoints && (
        <button
          className="btn btn-primary w-100 mt-3"
          onClick={handleSendPoints}
          disabled={pointsFields.filter(v => v).length < campos.length}
        >
          Confirmar puntos
        </button>
      )}

      {phase === 'score' && hasSentPoints && (
        <div className="alert alert-info mt-3">
          Puntos enviados. Esperando a que el host finalice la ronda...
        </div>
      )}

      {/* Solo el host puede finalizar la ronda (navega a score)*/}
      {isHost && phase === 'score' && (
        <button
          className='btn btn-success w-100'
          onClick={handleScore}
        >
          Finalizar ronda
        </button>
      )}


    </div>
  );
};
