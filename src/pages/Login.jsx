import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setIsHost, setUserName } from '../store/userSlice';


export const Login = () => {

  const [name, setName] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if( name.trim().length === 0 ) {
      toast.error('Pone el nombre!', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    
    dispatch(setUserName(name));
    dispatch(setIsHost(name.toLowerCase() === 'facundo'))
    toast.success(`Adentro ${name}`)
    navigate('/lobby');
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
