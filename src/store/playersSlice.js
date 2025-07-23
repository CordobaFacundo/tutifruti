import { createSlice } from "@reduxjs/toolkit";
import reducer from "./userSlice"


const initialState = {
    players: [],
}

export const playersSlice = createSlice({
    name: 'players',
    initialState,
    reducers: {
        addPlayer: (state, action) => {
            state.players.push({...action.payload, points: 0 });
        },
        removePlayer: (state, action) => {
            state.players = state.players.filter(player => player.id !== action.payload);
        },
        updatePlayerPoints: (state, action) => {
            const { name, points } = action.payload;
            const player = state.players.find(player => player.name === name);
            if (player) {
                player.points += points;
            }
        },
        resetAllPoints: (state) => {
            state.players.forEach(player => {
                player.points = 0;
            });
        },
        setPlayers: (state, action) => {
            state.players = action.payload;
        }
    }
})

export const { addPlayer, removePlayer, updatePlayerPoints, resetAllPoints, setPlayers } = playersSlice.actions;
export default playersSlice.reducer;