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
            state.letterHistory.push(action.payload);
            if (state.letterHistory.length > 8) {
                state.letterHistory.shift(); // Mantiene solo las últimas 8 letras
            }
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
        generateLetter: (state) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWYZ'.split('');
            const available = alphabet.filter(letter => !state.letterHistory.includes(letter));
            const options = available.length > 0 ? available : alphabet;
            const letter = options[Math.floor(Math.random() * options.length)];
            
            state.currentLetter = letter;
            state.letterHistory.push(letter);

            if (state.letterHistory.length > 8) {
                state.letterHistory.shift();
            }
        }
    }
});

export const { setPhase, setCurrentLetter, incrementRound, resetGame, generateLetter } = gameSlice.actions;
export default gameSlice.reducer;