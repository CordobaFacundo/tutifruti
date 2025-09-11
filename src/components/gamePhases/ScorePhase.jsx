import React from 'react'

export const ScorePhase = ({ 
  campos, 
  respuestas, 
  points, 
  pointsFields, 
  handlePoints, 
  handleSendPoints, 
  hasSentPoints, 
  handleScore, 
  isHost 
}) => {

  return (
    <div>
      {campos.map((campo, index) => (
        <div key={index} className="mb-3">
          <label className="form-label">{campo}</label>
          <input
            type="text"
            className="form-control mb-2"
            value={respuestas[index]}
            disabled
          />

          <div className="btn-group">
            <button
              className="btn btn-success mx-2"
              onClick={() => handlePoints(index, 10)}
              disabled={respuestas[index].trim().length <= 1 || pointsFields[index]}
            >
              +10
            </button>
            <button
              className="btn btn-warning mx-2"
              onClick={() => handlePoints(index, 5)}
              disabled={respuestas[index].trim().length <= 1 || pointsFields[index]}
            >
              +5
            </button>
            <button
              className="btn btn-danger mx-2"
              onClick={() => handlePoints(index, 0)}
              disabled={pointsFields[index]}
            >
              0
            </button>
          </div>
        </div>
      ))}

      {!hasSentPoints && (
        <button
          className="btn btn-primary w-100 mt-3"
          onClick={handleSendPoints}
          disabled={pointsFields.filter(v => v).length < campos.length}
        >
          Confirmar puntos
        </button>
      )}

      {hasSentPoints && (
        <div className="alert alert-info mt-3">
          Puntos enviados. Esperando a que el host finalice la ronda...
        </div>
      )}

      {isHost && (
        <button
          className="btn btn-success w-100 mt-3"
          onClick={handleScore}
        >
          Finalizar ronda
        </button>
      )}
    </div>
  );
};
