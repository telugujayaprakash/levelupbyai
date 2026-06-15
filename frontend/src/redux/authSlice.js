const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const API = require('../services/api');
import { getLocalDateString } from '../utils/date';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadSession = createAsyncThunk(
  'auth/loadSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        API.setToken(token);
        return { token, user };
      }
    } catch (error) {
      return rejectWithValue('Failed to load session');
    }
    return null;
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verify',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/verify', { email, otp });
      if (response && response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Verification failed');
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/otp/send', { email });
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to send OTP');
    }
  }
);

export const updateProfileName = createAsyncThunk(
  'auth/updateProfileName',
  async ({ name }, { getState, rejectWithValue }) => {
    try {
      const response = await API.post('/user/profile', { name });
      const state = getState();
      if (state.auth && state.auth.user) {
        const updatedUser = { ...state.auth.user, name: response.name };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to update name');
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'auth/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const clientDate = getLocalDateString();
      const response = await API.get(`/stats/dashboard?clientDate=${clientDate}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to load dashboard');
    }
  }
);

export const fetchSettings = createAsyncThunk(
  'auth/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/settings');
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to load settings');
    }
  }
);

export const saveSettings = createAsyncThunk(
  'auth/saveSettings',
  async ({ provider, apiKey }, { rejectWithValue }) => {
    try {
      const response = await API.post('/settings', { provider, apiKey });
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to save settings');
    }
  }
);
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    settings: { provider: 'Gemini', apiKey: '' },
    achievements: [],
    achievementsProgress: [],
    sessions: [],
    attempts: [],
    recentTechs: [],
    weakAreas: [],
    stats: { totalQuizzes: 0, totalQuestions: 0, accuracy: 0 },
    loading: false,
    dashboardLoading: false,
    isCheckingSession: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.settings = { provider: 'Gemini', apiKey: '' };
      state.achievements = [];
      state.achievementsProgress = [];
      state.recentTechs = [];
      state.weakAreas = [];
      state.stats = { totalQuizzes: 0, totalQuestions: 0, accuracy: 0 };
      API.setToken(null);
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserLocal: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Session
      .addCase(loadSession.pending, (state) => {
        state.isCheckingSession = true;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.isCheckingSession = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(loadSession.rejected, (state) => {
        state.isCheckingSession = false;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        API.setToken(action.payload.token);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboardLoading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.user = action.payload.user;
        state.stats = action.payload.stats;
        state.recentTechs = action.payload.recentTechs;
        state.weakAreas = action.payload.weakAreas;
        state.achievements = action.payload.achievements;
        state.achievementsProgress = action.payload.achievementsProgress || [];
      })
      .addCase(fetchDashboard.rejected, (state) => {
        state.dashboardLoading = false;
      })
      // Fetch Settings
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      // Save Settings
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      // Update Profile Name
      .addCase(updateProfileName.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, name: action.payload.name };
        }
      });
  }
});

export const { logout, clearError, updateUserLocal } = authSlice.actions;
export default authSlice.reducer;
