import React from 'react'

export const Navbar = ({ currentLetter, points, time = '60' }) => {

    return (
        < div className="bg-dark text-white py-2 px-3 d-flex justify-content-between align-items-center rounded" >
            <span>⏱ {time ?? '--'}s</span>
            <span className="fw-bold fs-5">Letra: {currentLetter ?? '-'}</span>
            <span>⭐ {points} pts</span>
        </div >
    )
}
