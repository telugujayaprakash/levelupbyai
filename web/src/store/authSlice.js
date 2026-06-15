import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';
import { getLocalDateString } from '../utils/date';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const sendOtp = createAsyncThunk('auth/sendOtp', async ({ email }, { rejectWithValue }) => {
  try { return await API.post('/auth/otp/send', { email }); }
  catch (e) { return rejectWithValue(e.error || 'Failed to send OTP'); }
});

export const verifyOtp = createAsyncThunk('auth/verify', async ({ email, otp }, { rejectWithValue }) => {
  try { return await API.post('/auth/verify', { email, otp }); }
  catch (e) { return rejectWithValue(e.error || 'Verification failed'); }
});

export const fetchDashboard = createAsyncThunk('auth/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const clientDate = getLocalDateString();
    return await API.get(`/stats/dashboard?clientDate=${clientDate}`);
  }
  catch (e) { return rejectWithValue(e.error || 'Failed to load dashboard'); }
});

export const fetchAnalytics = createAsyncThunk('auth/fetchAnalytics', async (_, { rejectWithValue }) => {
  try { return await API.get('/stats/analytics'); }
  catch (e) { return rejectWithValue(e.error || 'Failed to load analytics'); }
});

export const fetchSettings = createAsyncThunk('auth/fetchSettings', async (_, { rejectWithValue }) => {
  try { return await API.get('/settings'); }
  catch (e) { return rejectWithValue(e.error || 'Failed to load settings'); }
});

export const saveSettings = createAsyncThunk('auth/saveSettings', async ({ provider, apiKey }, { rejectWithValue }) => {
  try { return await API.post('/settings', { provider, apiKey }); }
  catch (e) { return rejectWithValue(e.error || 'Failed to save settings'); }
});

export const updateProfileName = createAsyncThunk('auth/updateProfileName', async ({ name }, { rejectWithValue }) => {
  try { return await API.post('/user/profile', { name }); }
  catch (e) { return rejectWithValue(e.error || 'Failed to update name'); }
});

export const generateQuiz = createAsyncThunk('auth/generateQuiz', async (payload, { rejectWithValue }) => {
  try {
    const response = await API.post('/quiz/generate', payload);
    return {
      ...response,
      technology: payload.technology,
      difficulty: payload.difficulty,
      specificTopic: payload.specificTopic
    };
  }
  catch (e) { return rejectWithValue(e.error || 'Failed to generate quiz'); }
});

export const submitQuiz = createAsyncThunk('auth/submitQuiz', async (payload, { rejectWithValue }) => {
  try { return await API.post('/quiz/submit', payload); }
  catch (e) { return rejectWithValue(e.error || 'Failed to submit quiz'); }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    settings: { provider: 'Gemini', apiKey: '' },
    stats: { totalQuizzes: 0, totalQuestions: 0, accuracy: 0 },
    recentTechs: [],
    weakAreas: [],
    achievements: [],
    achievementsProgress: [],
    analytics: null,
    quiz: null,
    quizResult: null,
    loading: false,
    dashboardLoading: false,
    quizLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.stats = { totalQuizzes: 0, totalQuestions: 0, accuracy: 0 };
      state.achievements = [];
      state.achievementsProgress = [];
      state.quiz = null;
      state.quizResult = null;
      localStorage.removeItem('token');
      API.setToken(null);
    },
    clearError: (state) => { state.error = null; },
    clearQuiz: (state) => { state.quiz = null; state.quizResult = null; },
  },
  extraReducers: (builder) => {
    builder
      // Verify OTP (Login/Register)
      .addCase(verifyOtp.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(verifyOtp.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem('token', a.payload.token);
        API.setToken(a.payload.token);
      })
      .addCase(verifyOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      // Dashboard
      .addCase(fetchDashboard.pending, (s) => { s.dashboardLoading = true; })
      .addCase(fetchDashboard.fulfilled, (s, a) => {
        s.dashboardLoading = false;
        s.user = a.payload.user;
        s.stats = a.payload.stats;
        s.recentTechs = a.payload.recentTechs;
        s.weakAreas = a.payload.weakAreas;
        s.achievements = a.payload.achievements;
        s.achievementsProgress = a.payload.achievementsProgress || [];
      })
      .addCase(fetchDashboard.rejected, (s) => { s.dashboardLoading = false; })
      // Analytics
      .addCase(fetchAnalytics.fulfilled, (s, a) => { s.analytics = a.payload; })
      // Settings
      .addCase(fetchSettings.fulfilled, (s, a) => { s.settings = a.payload; })
      .addCase(saveSettings.fulfilled, (s, a) => { s.settings = a.payload; })
      // Profile
      .addCase(updateProfileName.fulfilled, (s, a) => {
        if (s.user) s.user = { ...s.user, name: a.payload.name };
      })
      // Quiz generate
      .addCase(generateQuiz.pending, (s) => { s.quizLoading = true; s.error = null; s.quiz = null; })
      .addCase(generateQuiz.fulfilled, (s, a) => { s.quizLoading = false; s.quiz = a.payload; })
      .addCase(generateQuiz.rejected, (s, a) => { s.quizLoading = false; s.error = a.payload; })
      // Quiz submit
      .addCase(submitQuiz.fulfilled, (s, a) => { s.quizResult = a.payload; });
  },
});

export const { logout, clearError, clearQuiz } = authSlice.actions;
export default authSlice.reducer;
