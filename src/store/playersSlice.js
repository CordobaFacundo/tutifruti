import { createSlice } from "@reduxjs/toolkit";

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

export const { addPlayer, removePlayer, resetAllPoints, setPlayers } = playersSlice.actions;
export default playersSlice.reducer;