import { Login, Score, Lobby, Game, RoomAccess } from '../pages'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/room-access" replace />} />
        <Route path='/room-access' element={<RoomAccess />} />
        <Route path='/sala/:roomId' element={<Login />} />
        <Route path="/login" element={<Navigate to="/room-access" replace />} />
        <Route path="/sala/:roomId/lobby" element={<Lobby />} />
        <Route path="/sala/:roomId/game" element={<Game />} />
        <Route path="/sala/:roomId/score" element={<Score />} />
        <Route path="/*" element={<Navigate to="/room-access" replace />} />
      </Routes>
    </BrowserRouter>
  )
}