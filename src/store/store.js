import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import playersReducer from './playersSlice';
import gameReducer from './gameSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    players: playersReducer, // Assuming you have a playersReducer imported
    game: gameReducer, // Add your gameSlice reducer here
  },
});