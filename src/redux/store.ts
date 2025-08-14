import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Import the default reducer

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ✅ Define RootState type
export type RootState = ReturnType<typeof store.getState>;
// ✅ Define AppDispatch type
export type AppDispatch = typeof store.dispatch;

export default store;
