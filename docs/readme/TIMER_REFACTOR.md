# Refactor: Migración del timer del frontend al backend

## Contexto

El juego Tutti Frutti Futbolero requiere un temporizador compartido entre todos los jugadores de una sala. En la implementación original, cada cliente (navegador) corría su propio `setInterval` de forma independiente. Esto generaba los siguientes problemas:

- Jugadores con diferente latencia podían tener timers desincronizados.
- Si un jugador se unía tarde o navegaba a la pantalla de juego con demora, su timer arrancaba en un momento distinto al resto.
- El frontend era quien decidía cuándo terminaba el tiempo, emitiendo `force_end_play` de forma individual, lo que podía causar que distintos clientes terminen la ronda en momentos diferentes.

La solución fue centralizar el control del tiempo en el servidor, convirtiendo el timer en una fuente única de verdad para toda la sala.

---

## Cambios en el backend (`index.js`)

### 1. Nueva estructura de sala

Se reemplazó el array plano de jugadores por un objeto que incluye los jugadores y un objeto `timer`:

```js
playersPerRoom[roomId] = {
  players: [],
  timer: {
    timeoutId: null,  // referencia al setTimeout activo
    endsAt: null,     // timestamp de cuándo termina el tiempo
    duration: 90      // duración de cada ronda en segundos
  }
};
```

El campo `endsAt` es clave: al ser un timestamp absoluto (`Date.now() + 90000`), cualquier cliente puede calcular el tiempo restante en cualquier momento simplemente haciendo `endsAt - Date.now()`, sin importar cuándo se conectó o cuándo montó el componente.

### 2. Inicio del timer en `start_game` y `new_round`

En ambos eventos se ejecuta la misma lógica:

```js
room.timer.endsAt = Date.now() + room.timer.duration * 1000;

room.timer.timeoutId = setTimeout(() => {
  io.to(roomId).emit('force_end_play');
}, room.timer.duration * 1000);

io.to(roomId).emit('round_timer_started', { endsAt: room.timer.endsAt });
```

- El servidor guarda el `endsAt` en memoria para poder consultarlo después.
- El `setTimeout` es el único responsable de terminar la ronda cuando se acaba el tiempo, emitiendo `force_end_play` a toda la sala desde el servidor.
- Se emite `round_timer_started` con el `endsAt` para que todos los clientes puedan arrancar su visualización del timer de forma sincronizada.

### 3. Cancelación del timer en `force_end_play`

Cuando un jugador hace STOP antes de que se acabe el tiempo, el cliente emite `force_end_play`. El servidor debe cancelar el `setTimeout` activo para que no dispare después:

```js
if (room.timer.timeoutId) {
  clearTimeout(room.timer.timeoutId);
  room.timer.timeoutId = null;
}
room.timer.endsAt = null;
```

Sin esto, el servidor terminaría emitiendo `force_end_play` dos veces: una por el STOP y otra cuando el timeout original expire.

### 4. Nuevo evento `get_timer`

Se agregó un evento de consulta para que los clientes puedan pedir el estado actual del timer al montarse:

```js
socket.on('get_timer', (roomId, cb) => {
  const room = playersPerRoom[roomId];
  if (room && room.timer.endsAt) {
    cb({ endsAt: room.timer.endsAt });
  } else {
    cb(null);
  }
});
```

Esto resuelve el caso donde un cliente navega a la pantalla de juego después de que el evento `round_timer_started` ya fue emitido y por lo tanto se lo perdió.

---

## Cambios en el frontend (`Game.jsx`)

### 1. Se eliminó el `setInterval` independiente por cliente

El timer anterior corría de forma completamente autónoma en cada navegador:

```js
// ELIMINADO
useEffect(() => {
  if (phase !== 'play') return;
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        socket.emit('force_end_play', roomId); // cada cliente emitía esto
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [phase, roomId]);
```

### 2. El timer visual ahora se basa en `endsAt`

El nuevo `useEffect` escucha el evento `round_timer_started` y usa el `endsAt` recibido del servidor para calcular el tiempo restante en cada tick:

```js
useEffect(() => {
  const handleTimerStarted = ({ endsAt }) => {
    setTimeLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));

    timerIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }, 1000);
  };

  socket.on('round_timer_started', handleTimerStarted);
  // ...
}, [roomId]);
```

El frontend ya no emite `force_end_play` cuando llega a 0. Solo actualiza la pantalla. La decisión de terminar la ronda siempre viene del servidor.

### 3. Consulta del timer al montar el componente

Para resolver el caso específico del host (que navega a `/game` justo cuando el servidor emite `round_timer_started` y puede perderse el evento), se agregó una consulta al montar:

```js
useEffect(() => {
  socket.emit('get_timer', roomId, (data) => {
    if (data?.endsAt) {
      // Iniciar el intervalo visual con el endsAt ya existente
    }
  });
}, [roomId]);
```

### 4. Uso de `useRef` para `respuestas` en `force_end_play`

El `useEffect` de `force_end_play` necesitaba acceder al estado `respuestas` al momento de ejecutarse. Si `respuestas` era una dependencia del efecto, el efecto se re-registraba cada vez que el usuario escribía en un campo, lo que interrumpía el intervalo del timer.

La solución fue usar una ref que se mantiene actualizada sin ser dependencia de ningún efecto:

```js
const respuestasRef = useRef(respuestas);

useEffect(() => {
  respuestasRef.current = respuestas;
}, [respuestas]);

// En force_end_play:
socket.emit('send_responses', { roomId, playerId: userId, respuestas: respuestasRef.current });
```

---

## Resumen del flujo final

1. El host inicia la partida → el servidor calcula `endsAt`, guarda el `setTimeout` y emite `round_timer_started`.
2. Todos los clientes reciben `round_timer_started` con el `endsAt` y arrancan su visualización.
3. El cliente que monta el componente tarde consulta `get_timer` y obtiene el `endsAt` vigente.
4. Si un jugador hace STOP → emite `force_end_play` al servidor → el servidor cancela el `setTimeout` y retransmite `force_end_play` a toda la sala.
5. Si nadie hace STOP → el `setTimeout` del servidor expira y emite `force_end_play` a toda la sala.
6. Todos los clientes reciben `force_end_play`, envían sus respuestas y cambian a la fase de puntuación.
