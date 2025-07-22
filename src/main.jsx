import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TutifrutiApp } from './TutifrutiApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TutifrutiApp />
  </StrictMode>,
)
