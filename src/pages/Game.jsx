import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updatePlayerPoints } from '../store/playersSlice';
import { Navbar } from '../components/Navbar';

export const Game = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const userName = useSelector((state) => state.user.userName);
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
  const [currentLetter, setCurrentLetter] = useState(''); // Aquí podrías implementar la lógica para obtener una letra aleatoria
  const [lasLetter, setLasLetter] = useState([]);

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
    dispatch(updatePlayerPoints({ name: userName, points }));
    navigate('/score');
  }
  
  // Simula la obtención de una letra aleatoria
  useEffect(() => {
    if (fase === 'jugar' && currentLetter === '') {
      generateNewLatter(); // Genera una nueva letra al entrar en la fase de puntuar
    }
  }, [fase])

  const generateNewLatter = () => {
    const letter = getRandomLetter();
    setCurrentLetter(letter);
    setLasLetter(prev => [letter, ...prev].slice(0, 5)); // Guarda las últimas 5 letras
  }

  const getRandomLetter = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const available = alphabet.filter(letter => !lasLetter.includes(letter));
    const options = available.length > 0 ? available : alphabet;
    return options[Math.floor(Math.random() * options.length)];
  }
  

  return (
    <div className="container py-4">
      <Navbar currentLetter={currentLetter} points={points} />

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
