import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userName: '',
    isHost: false,
    points: 0,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserName: (state, action) => {
            state.userName = action.payload;
        },
        clearUser: (state) => {
            state.userName = '';
        },
        setIsHost: (state, action) => {
            state.isHost = action.payload;
        },
        setUserPoints: (state, action) => {
            state.points = action.payload;
        },
        resetPointsUser: (state) => {
            state.points = 0;
        },
    },
})

export const { setUserName, clearUser, setIsHost, setUserPoints, resetPointsUser } = userSlice.actions;
export default userSlice.reducer;