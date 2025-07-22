import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: '',
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserName: (state, action) => {
            state.name = action.payload;
        },
        clearUser: (state) => {
            state.name = '';
        },
    },
})

export const { setUserName, clearUser } = userSlice.actions;
export default userSlice.reducer;