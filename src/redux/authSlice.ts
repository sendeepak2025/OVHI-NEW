import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  loading: boolean;
  token: string | null;
  otpToken: string | null;
  user: Record<string, any> | null;
}

const initialState: AuthState = {
  loading: false,
  otpToken: null,
  token: Cookies.get("token") || null,
  user: Cookies.get("user") ? JSON.parse(Cookies.get("user") as string) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (action.payload) {
        Cookies.set("token", action.payload, { expires: 1 }); // 1 day
      } else {
        Cookies.remove("token");
      }
    },
    setOtpToken(state, action: PayloadAction<string | null>) {
      state.otpToken = action.payload;
    },
    setUser(state, action: PayloadAction<Record<string, any> | null>) {
      state.user = action.payload;
      if (action.payload) {
        Cookies.set("user", JSON.stringify(action.payload), { expires: 1 });
      } else {
        Cookies.remove("user");
      }
    },
  },
});

export const { setLoading, setToken, setUser, setOtpToken } = authSlice.actions;
export default authSlice.reducer;
