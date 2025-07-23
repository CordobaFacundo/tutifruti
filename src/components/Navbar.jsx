import React from 'react'

export const Navbar = ({ currentLetter, points, timeLeft }) => {

    return (
        < div className="bg-dark text-white py-2 px-3 d-flex justify-content-between align-items-center rounded sticky-top shadow-sm" style={{ zIndex: 1000 }} >
            <span>⏱ {timeLeft ?? '--'}s</span>
            <span className="fw-bold fs-5">Letra: {currentLetter ?? '-'}</span>
            <span>⭐ {points} pts</span>
        </div >
    )
}
