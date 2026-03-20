import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setIsHost, setUserName, setUserId } from '../store/userSlice';
import { setRoomId } from '../store/roomSlice';
import socket from '../socket/socket';

export const Login = () => {

  const { roomId } = useParams(); // Obtenemos el roomId de la URL

  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('🟢 Conectado al servidor: ', socket.id);
    })

    return () => {
      socket.off('connect');
    }
  }, []);

  useEffect(() => {
    if (!roomId) {
      navigate('/room-access', { replace: true });
    }
  }, [roomId, navigate]);

  useEffect(() => {
    const handleRoomJoined = ({ roomId, user }) => {
      dispatch(setUserName(user.name));
      dispatch(setUserId(user.id));
      dispatch(setIsHost(user.isHost));
      dispatch(setRoomId(roomId));
      setIsJoining(false);
      toast.success(`Adentro ${user.name}`);
      navigate(`/sala/${roomId}/lobby`);
    };

    const handleRoomError = ({ message }) => {
      setIsJoining(false);
      toast.error(message, {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
    };

    socket.on('room_joined', handleRoomJoined);
    socket.on('room_error', handleRoomError);

    return () => {
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_error', handleRoomError);
    }

  }, [dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      toast.error('Ingresá un nombre válido', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
      return;
    }

    setIsJoining(true);
    socket.emit('join_room', { roomId, name: name.trim() });
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div className="bg-dark p-4 rounded shadow-lg text-white">
          <h2 className="text-center mb-2">Tutifruti Futbolero</h2>
          <p className="text-center text-secondary mb-4">
            Sala: <strong className="text-white">{roomId}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Tu nombre</label>
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Escribí tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={isJoining}
            >
              {isJoining ? 'Entrando...' : 'Entrar al lobby'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
