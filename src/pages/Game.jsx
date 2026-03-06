import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
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
  const [timeLeft, setTimeLeft] = useState(90);
  const [hasSentPoints, setHasSentPoints] = useState(false);
  const [allResponses, setAllResponses] = useState([])
  const timerIntervalRef = useRef(null); // Referencia para el intervalo del temporizador
  const respuestasRef = useRef(respuestas); // Referencia para las respuestas

  useEffect(() => {
    respuestasRef.current = respuestas;
  }, [respuestas]);

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
    socket.emit('force_end_play', roomId);
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
      //setTimeLeft(60);
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

  useEffect(() => {
    socket.on("all_responses", (data) => {
      setAllResponses(data);
    })
  
    return () => socket.off("all_responses");
   }, []);
  

  //Timer
  //El servidor envia endsAt, el front solo lo usa para mostar el tiempo visualmente
  useEffect(() => {
    const handleTimerStarted = ({ endsAt }) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setTimeLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));

      timerIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }, 1000);
    }

    socket.on('round_timer_started', handleTimerStarted);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      socket.off('round_timer_started', handleTimerStarted);
    }
  }, [roomId]);

  // Al montar el componente, consultar si hay un timer activo en el servidor
  // Esto resuelve el caso donde el host navega a /game y se pierde el round_timer_started
  useEffect(() => {
    socket.emit('get_timer', roomId, (data) => {
      if (data?.endsAt) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setTimeLeft(Math.max(0, Math.ceil((data.endsAt - Date.now()) / 1000)));
        timerIntervalRef.current = setInterval(() => {
          const remaining = Math.max(0, Math.ceil((data.endsAt - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
        }, 1000);
      }
    });
  }, [roomId]); // Solo se ejecuta al montar


  useEffect(() => {
    if(!currentLetter) {
      socket.emit('get_current_letter', roomId, (letter) => {
        if(letter) {
          dispatch(setCurrentLetter(letter));
        }
      });
    }
  
  }, [currentLetter, dispatch, roomId]);


  useEffect(() => {
    const handleForceEndPlay = () => {
      if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      }
      console.log('⚡ force_end_play recibido por', userId, 'isHost:', isHost);
      socket.emit('send_responses', { roomId, playerId: userId, respuestas: respuestasRef.current });
      socket.emit('change_phase', { roomId, phase: 'score' });
    };

    socket.on('force_end_play', handleForceEndPlay);

    return () => socket.off('force_end_play', handleForceEndPlay);
  }, [roomId, userId]); 
  

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
          allResponses={allResponses}
          campos={campos}
          respuestas={respuestas}
          points={points}
          userId={userId}
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
