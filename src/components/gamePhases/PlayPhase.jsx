import React from 'react'

export const PlayPhase = ({
    campos,
    respuestas,
    setRespuestas,
    handleEndPlay,
    timeLeft,
}) => {

    const handleInputChange = (index, value) => {
        const nuevasRespuestas = [...respuestas];
        nuevasRespuestas[index] = value;
        setRespuestas(nuevasRespuestas);
    };

    return (
        <div>
            {campos.map((campo, index) => (
                <div key={index} className="mb-3">
                    <label className="form-label">{campo}</label>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder={`Escribí un ${campo.toLowerCase()}`}
                        value={respuestas[index]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                </div>
            ))}

            {/* Timer visible solo a modo informativo */}
            <div className="alert alert-info text-center">
                Tiempo restante: {timeLeft}s
            </div>

            <button
                className="btn btn-primary w-100"
                onClick={handleEndPlay}
            >
                Terminar
            </button>
        </div>
    );
};

