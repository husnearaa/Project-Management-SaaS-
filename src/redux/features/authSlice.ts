import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "MANAGER" | "MEMBER";
  status?: string;
  authProvider?: string;
  emailVerified?: boolean;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: null,
  refresh_token: null,
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      Cookies.set("accessToken", action.payload.token, {
        expires: 1,
        sameSite: "lax",
        secure:
          typeof window !== "undefined" &&
          window.location.protocol === "https:",
      });
    },

    setRefreshToken: (
      state,
      action: PayloadAction<{ refresh_token: string }>
    ) => {
      state.refresh_token = action.payload.refresh_token;

      Cookies.set("refreshToken", action.payload.refresh_token, {
        expires: 7,
        sameSite: "lax",
        secure:
          typeof window !== "undefined" &&
          window.location.protocol === "https:",
      });
    },

    logout: (state) => {
      state.token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
      state.user = null;

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },

    initializeAuth: (state) => {
      const token = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      state.token = token ?? null;
      state.isAuthenticated = Boolean(token);
      state.refresh_token = refreshToken ?? null;
    },
  },
});

export const {
  setUser,
  setRefreshToken,
  logout,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;














// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";
// interface AuthState {
//   token: string | null;
//   refresh_token: string | null;
//   isAuthenticated: boolean;
// }

// const initialState: AuthState = {
//   token: null,
//   refresh_token: null,
//   isAuthenticated: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUser: (state, action: PayloadAction<{ token: string }>) => {
//       state.token = action.payload.token;
//       state.isAuthenticated = true;
//     },
//     setRefreshToken: (
//       state,
//       action: PayloadAction<{ refresh_token: string }>,
//     ) => {
//       state.refresh_token = action.payload.refresh_token;
//     },
//     logout: (state) => {
//       state.token = null;
//       state.refresh_token = null;
//       state.isAuthenticated = false;
//       Cookies.remove("accessToken");
//       Cookies.remove("refreshToken");
//     },

//     initializeAuth: (state) => {
//       const token = Cookies.get("accessToken");
//       const refreshToken = Cookies.get("refreshToken");
//       if (token) {
//         state.token = token;
//         state.isAuthenticated = true;
//       }
//       if (refreshToken) {
//         state.refresh_token = refreshToken;
//       }
//     },
//   },
// });

// export const { setUser, setRefreshToken, logout, initializeAuth } =
//   authSlice.actions;

// export default authSlice.reducer;
