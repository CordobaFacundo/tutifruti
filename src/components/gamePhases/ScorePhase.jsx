import React from 'react'

export const ScorePhase = ({
  allResponses,
  campos,
  userId,
  pointsFields,
  handlePoints,
  handleSendPoints,
  hasSentPoints,
  handleScore,
  isHost
}) => {

  return (
    <div className="container mt-4">
      {campos.map((campo, campoIndex) => (
        <div key={campoIndex} className="mb-4">
          <div className="card shadow-sm rounded-4">
            {/* Título del campo */}
            <div className="card-header bg-dark text-white rounded-top-4">
              <h5 className="mb-0">{campo}</h5>
            </div>

            <div className="card-body p-0">
              <table className="table table-striped table-hover align-middle mb-0 rounded-bottom-4">
                <thead className="table-light">
                  <tr className="text-center">
                    <th style={{ width: "30%" }}>Jugador</th>
                    <th style={{ width: "40%" }}>Respuesta</th>
                    <th style={{ width: "40%" }}>Puntaje</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(allResponses) &&
                    allResponses.map((player) => (
                      <tr key={player.id} className="text-center">
                        <td>{player.name}</td>
                        <td>
                          {player.responses && player.responses[campoIndex] !== ""
                            ? player.responses[campoIndex]
                            : "—"}
                        </td>
                        <td>
                          {player.id === userId && (
                            <div className="d-flex flex-column align-items-center gap-1">
                              <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
                                {/* Botón 10 pts */}
                                <button
                                  className="btn btn-sm btn-success rounded-pill"
                                  onClick={() => handlePoints(campoIndex, 10)}
                                  disabled={
                                    !player.responses ||
                                    !player.responses[campoIndex] ||
                                    player.responses[campoIndex].trim().length <= 1 ||
                                    pointsFields[campoIndex]
                                  }
                                >
                                  10
                                </button>

                                {/* Botón 5 pts */}
                                <button
                                  className="btn btn-sm btn-warning rounded-pill"
                                  onClick={() => handlePoints(campoIndex, 5)}
                                  disabled={
                                    !player.responses ||
                                    !player.responses[campoIndex] ||
                                    player.responses[campoIndex].trim().length <= 1 ||
                                    pointsFields[campoIndex]
                                  }
                                >
                                  5
                                </button>

                                {/* Botón 0 pts */}
                                <button
                                  className="btn btn-sm btn-secondary rounded-pill"
                                  onClick={() => handlePoints(campoIndex, 0)}
                                  disabled={pointsFields[campoIndex]}
                                >
                                  0
                                </button>
                              </div>

                              {/* Feedback del puntaje asignado */}
                              {pointsFields[campoIndex] != null && (
                                <div className="mt-1 small text-muted">
                                  {pointsFields[campoIndex]} pts asignados
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {/* 🔹 Botones debajo de las tablas */}
      {!hasSentPoints && (
        <>
          {pointsFields.filter((v) => v != null).length < campos.length && (
            <div className="alert alert-warning mt-3 text-center py-2">
              ⚠️ Falta puntuar alguna categoría para poder confirmar.
            </div>
          )}

          <button
            className="btn btn-primary w-100 mt-3"
            onClick={handleSendPoints}
            disabled={pointsFields.filter((v) => v != null).length < campos.length}
          >
            Confirmar puntos
          </button>
        </>
      )}

      {hasSentPoints && (
        <div className="alert alert-info mt-3 text-center">
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



