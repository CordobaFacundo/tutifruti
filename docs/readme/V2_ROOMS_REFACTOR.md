# 🧠 Tutti Frutti Futbolero — V2 Rooms Refactor

## 📌 Objetivo de la V2

Reemplazar el sistema anterior de host hardcodeado por un sistema real de salas dinámicas, manteniendo el flujo del juego existente completamente funcional.

---

## 🚨 Problema en V1

En la versión anterior:

- El host estaba definido por nombre (`facundo`)
- Las salas no existían realmente en backend
- `join_room` creaba salas implícitamente
- No había validación de código
- No existía separación entre:
  - crear sala
  - validar sala
  - unirse a sala

Esto limitaba la escalabilidad y generaba inconsistencias.

---

## ✅ Objetivos alcanzados en V2

- Crear salas dinámicamente desde backend
- Generar códigos únicos de 4 dígitos
- Permitir unirse a salas existentes mediante código
- Validar existencia de sala antes de entrar
- Definir el host desde backend (no frontend)
- Mantener el flujo completo del juego sin romper funcionalidad existente

---

## 🧩 Cambios en el Frontend

### Nueva pantalla principal

Se agregó `/room-access` como entrada de la app:

- Botón **Crear sala**
- Input para **código de sala**
- Botón **Unirse**
- Diseño mobile-first

### Nuevo flujo de usuario

#### Host
1. Crear sala
2. Recibir código (roomId)
3. Ingresar nombre
4. Entrar al lobby como host

#### Invitado
1. Ingresar código
2. Validar sala
3. Ingresar nombre
4. Entrar al lobby como jugador

---

### Redux

Se separaron responsabilidades:

#### `userSlice`
- userName
- userId
- isHost
- points

#### `roomSlice`
- roomId

---

### Eventos de socket (frontend)

#### Entrada
- `create_room`
- `validate_room`
- `join_room`

#### Salida
- `room_created`
- `room_validated`
- `room_joined`
- `room_error`
- `players_updated`

---

## 🧠 Cambios en el Backend

### Nueva arquitectura

```bash
server/
  index.js
  socket/
    roomEvents.js
  roomStore.js
  utils/
    letterGenerator.js
    roomUtils.js

    
## roomUtils.js

Funciones auxiliares:

    #generar código de sala único
    
    #crear sala
    
    #agregar/quitar jugadores
    
    #validar nombres duplicados
    
    #reasignar host
    
    #limpiar timers
    
    #encontrar sala por socket
    
    #roomEvents.js

Eventos principales:

    #create_room
    
    #genera sala
    
    #asigna host inicial
    
    #responde con room_created
    
    #validate_room
    
    #verifica existencia
    
    #responde con room_validated o room_error
    
    #join_room
    
    #valida sala y nombre
    
    #evita duplicados
    
    #agrega jugador
    
    #determina host real
    
    #emite room_joined
    
    #emite players_updated
    
    #index.js
    
Se adapta para:

usar rooms como estado central

eliminar lógica vieja de creación de sala en join_room

integrar roomEvents

mantener lógica existente del juego

manejar disconnect con:

eliminación de jugador

reasignación de host

eliminación de sala vacía