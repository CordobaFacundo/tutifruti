import React from 'react'
import { Login } from '../pages/Login'
import { Score } from '../pages/Score'
import { Lobby } from '../pages/Lobby'
import { Game } from '../pages/Game'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/score" element={<Score />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        {/* Ruta por defecto */}
        <Route path="/*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}