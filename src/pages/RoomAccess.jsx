import { toast } from "react-toastify";
import { clearUser } from "../store/userSlice";
import { setRoomId, clearRoomId } from "../store/roomSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";


export const RoomAccess = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRoomCreated = ({ roomId }) => {
      dispatch(clearUser());
      dispatch(clearRoomId());
      dispatch(setRoomId(roomId));
      setIsLoading(false);
      navigate(`/sala/${roomId}`);
    };

    const handleRoomValidated = ({ roomId }) => {
      dispatch(clearUser());
      dispatch(clearRoomId());
      dispatch(setRoomId(roomId));
      setIsLoading(false);
      navigate(`/sala/${roomId}`);
    };

    const handleRoomError = ({ message }) => {
      setIsLoading(false);
      toast.error(message, {
        position: 'bottom-right',
        autoClose: 2500,
        theme: 'dark',
      });
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('room_validated', handleRoomValidated);
    socket.on('room_error', handleRoomError);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_validated', handleRoomValidated);
      socket.off('room_error', handleRoomError);
    };
  
  }, [dispatch, navigate]);

  const handleCreateRoom = () => {
    setIsLoading(true);
    socket.emit('create_room');
  };

  const handleJoinRoom = () => {
    const normalizedCode = roomCode.trim()

    if (!/^\d{4}$/.test(normalizedCode)) {
      toast.error('Ingresá un código válido de 4 dígitos', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'dark',
      });
      return;
    }

    setIsLoading(true);
    socket.emit('validate_room', { roomId: normalizedCode });
  };
  

  return (
    <div
      className="d-flex align-items-center justify-content-center px-3"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #005d1f 0%, #1e7a42 100%)',
      }}
    >
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <div className="bg-dark p-4 p-md-5 rounded shadow-lg text-white">
          <h1 className="text-center mb-2">Tutifruti Futbolero</h1>
          <h3 className="text-center mb-4 fw-normal">Sala de juego</h3>

          <button
            className="btn btn-success w-100 mb-4"
            onClick={handleCreateRoom}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Crear sala'}
          </button>

          <hr className="border-secondary my-4" />

          <div className="mb-3">
            <label htmlFor="roomCode" className="form-label">
              Unirse a sala
            </label>
            <input
              id="roomCode"
              type="text"
              inputMode="numeric"
              maxLength={4}
              className="form-control"
              placeholder="Código de 4 dígitos"
              value={roomCode}
              onChange={(e) =>
                setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 4))
              }
            />
          </div>

          <button
            className="btn btn-primary w-100"
            onClick={handleJoinRoom}
            disabled={isLoading}
          >
            {isLoading ? 'Validando...' : 'Unirse'}
          </button>
        </div>
      </div>
    </div>
  )
}
