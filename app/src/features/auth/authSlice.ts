import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/AuthAPi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface AuthState {
  status: AsyncStatus
  rtStatus: AsyncStatus
  error?: string
  rtError?: string
  user?: any
  rtToken?: any
}

const initialState: AuthState = {
  status: 'idle',
  rtStatus: 'idle',
  error: undefined,
  rtError: undefined,
  user: undefined,
  rtToken: undefined,
}

export const login = createAsyncThunk(
  'auth/login',
  async (payload: api.AuthRequest, thunkApi) => {
    try {
      return await api.authenticate(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Authentication failed'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (payload: api.AdminLoginRequest, thunkApi) => {
    try {
      return await api.adminLogin(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Admin login failed'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const authenticateRT = createAsyncThunk(
  'auth/authenticateRT',
  async (payload: api.AuthRequest, thunkApi) => {
    try {
      return await api.rtAuth(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'RT Authentication failed'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = undefined
      state.status = 'idle'
      state.error = undefined
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
    },
    clearAuthError(state) {
      state.error = undefined
      state.rtError = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      // Main Auth
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        const token = typeof action.payload === 'string' ? action.payload : (action.payload?.accessToken || action.payload?.access_token || action.payload?.token)
        if (token) localStorage.setItem('access_token', token)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        const token = typeof action.payload === 'string' ? action.payload : (action.payload?.accessToken || action.payload?.access_token || action.payload?.token)
        if (token) localStorage.setItem('access_token', token)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // RT Auth
      .addCase(authenticateRT.pending, (state) => {
        state.rtStatus = 'loading'
        state.rtError = undefined
      })
      .addCase(authenticateRT.fulfilled, (state, action) => {
        state.rtStatus = 'succeeded'
        state.rtToken = action.payload
      })
      .addCase(authenticateRT.rejected, (state, action) => {
        state.rtStatus = 'failed'
        state.rtError = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export const authReducer = authSlice.reducer
