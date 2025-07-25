import React from 'react'
import { Login, Score, Lobby, Game } from '../pages'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/sala/:roomId' element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sala/:roomId/lobby" element={<Lobby />} />
        <Route path="/sala/:roomId/game" element={<Game />} />
        <Route path="/sala/:roomId/score" element={<Score />} />
        {/* Ruta por defecto */}
        <Route path="/*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}