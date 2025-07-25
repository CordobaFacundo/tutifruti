import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setIsHost, setUserName, setUserId } from '../store/userSlice';
import { addPlayer } from '../store/playersSlice';
import socket from '../socket/socket';
import { useParams } from 'react-router-dom';


export const Login = () => {

  const { roomId } = useParams(); // Obtenemos el roomId de la URL

  useEffect(() => {
    socket.on('connect', () => {
      console.log('🟢 Conectado al servidor: ', socket.id);
    })

    return () => {
      socket.off('connect'); //Limpiamos el listener al desmontar
    }
  }, []);
  

  const [name, setName] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if( name.trim().length === 0 ) {
      toast.error('Pone el nombre!', {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    const actualRoomId = roomId || 'sala123'; // Si no hay roomId en la URL, usamos uno por defecto
    
    dispatch(setUserName(name));
    dispatch(setUserId(socket.id)); // Guardamos el ID del socket como userId
    // Si el nombre es "facundo", lo marcamos como host
    dispatch(setIsHost(name.toLowerCase() === 'facundo'))
    dispatch(addPlayer({ id: socket.id, name, points: 0 }));
    toast.success(`Adentro ${name}`)
    socket.emit('join_room', {
      roomId: actualRoomId || 'sala123', 
      name: name
    });
    navigate(`/sala/${actualRoomId}/lobby`);
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div className="bg-dark p-4 rounded shadow-lg text-white">
          <h2 className="text-center mb-4">Tutti frutti furbolero</h2>
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
            <button type="submit" className="btn btn-success w-100">Ingresar</button>
          </form>
        </div>
      </div>
    </div>
  )
}
