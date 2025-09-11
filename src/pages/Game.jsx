import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { toast } from 'react-toastify';
import { setPhase, setCurrentLetter } from '../store/gameSlice';
import socket from '../socket/socket';
import { PlayPhase, ScorePhase } from '../components/gamePhases';

export const Game = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams(); // Obtenemos el roomId de la URL

  const { isHost, userId } = useSelector((state) => state.user);
  const { phase, currentLetter } = useSelector((state) => state.game);

  const campos = [
    'Jugador argentino',
    'Jugador actual extranjero',
    'Jugador retirado',
    'Selección nacional',
    'Club',
    'Jugador ganador de Champions League',
    'Jugador ganador del Mundial',
  ];
  //Estados
  const [respuestas, setRespuestas] = useState(Array(campos.length).fill(''));
  const [points, setPoints] = useState(0);
  const [pointsFields, setPointsFields] = useState(Array(campos.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(60); // Tiempo inicial de 60 segundos
  const [hasSentPoints, setHasSentPoints] = useState(false);

  //Handlers
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

      { phase === 'play' && (
        <PlayPhase
          campos={campos}
          respuestas={respuestas}
          setRespuestas={setRespuestas}
          handleEndPlay={handleEndPlay}
          timeLeft={timeLeft}
        />
      )}
      
      { phase === 'score' && (
        <ScorePhase
          campos={campos}
          respuestas={respuestas}
          points={points}
          pointsFields={pointsFields}
          handlePoints={handlePoints}
          handleSendPoints={handleSendPoints}
          hasSentPoints={hasSentPoints}
          handleScore={handleScore}
          isHost={isHost}
        />
      )}
    </div>
  );
};
