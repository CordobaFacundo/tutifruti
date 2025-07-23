import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import playersReducer from './playersSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    players: playersReducer, // Assuming you have a playersReducer imported
  },
});