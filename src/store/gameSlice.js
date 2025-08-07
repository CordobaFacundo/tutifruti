import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    phase: 'play',
    currentLetter: '',
    roundNumber: 1,
    letterHistory: [],
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setPhase: (state, action) => {
            state.phase = action.payload;
        },
        setCurrentLetter: (state, action) => {
            state.currentLetter = action.payload;
        },
        incrementRound: (state) => {
            state.roundNumber += 1;
        },
        resetGame: (state) => {
            state.phase = 'play';
            state.currentLetter = '';
            state.roundNumber = 1;
            state.letterHistory = [];
        },
    }
});

export const { setPhase, setCurrentLetter, incrementRound, resetGame } = gameSlice.actions;
export default gameSlice.reducer;