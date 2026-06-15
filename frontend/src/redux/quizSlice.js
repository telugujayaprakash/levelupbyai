const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const API = require('../services/api');
const { updateUserLocal, fetchDashboard } = require('./authSlice');
import { getLocalDateString } from '../utils/date';

export const generateQuizAction = createAsyncThunk(
  'quiz/generate',
  async ({ technology, difficulty, count, specificTopic }, { rejectWithValue }) => {
    try {
      const response = await API.post('/quiz/generate', { technology, difficulty, count, specificTopic });
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to generate quiz');
    }
  }
);

export const submitQuizAction = createAsyncThunk(
  'quiz/submit',
  async ({ technology, difficulty, score, totalQuestions, attempts }, { getState, dispatch, rejectWithValue }) => {
    try {
      const specificTopic = getState().quiz.specificTopic;
      const clientDate = getLocalDateString();
      const response = await API.post('/quiz/submit', {
        technology,
        difficulty,
        score,
        totalQuestions,
        attempts,
        clientDate,
        specificTopic
      });
      // Update User profile stats locally
      dispatch(updateUserLocal(response.user));
      // Reload dashboard metrics
      dispatch(fetchDashboard());
      return response;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to submit quiz');
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    selectedTech: 'JavaScript',
    selectedDifficulty: 'Intermediate',
    selectedCount: 5,
    specificTopic: null,
    quizState: 'idle', // 'idle' | 'loading' | 'success' | 'error'
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswerIndex: null,
    isAnswerSubmitted: false,
    score: 0,
    currentAttempts: [],
    completedSession: null,
    errorMessage: '',
  },
  reducers: {
    updateTech: (state, action) => {
      state.selectedTech = action.payload;
      state.specificTopic = null;
    },
    updateDifficulty: (state, action) => {
      state.selectedDifficulty = action.payload;
    },
    updateCount: (state, action) => {
      state.selectedCount = action.payload;
    },
    setSpecificTopic: (state, action) => {
      state.selectedTech = action.payload.tech;
      state.specificTopic = action.payload.topic;
    },
    selectAnswer: (state, action) => {
      if (!state.isAnswerSubmitted) {
        state.selectedAnswerIndex = action.payload;
      }
    },
    submitAnswer: (state) => {
      if (state.selectedAnswerIndex === null) return;
      
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = state.selectedAnswerIndex === currentQuestion.correctAnswer;
      
      state.isAnswerSubmitted = true;
      if (isCorrect) {
        state.score += 1;
      }
      
      state.currentAttempts.push({
        question: currentQuestion.question,
        selectedAnswer: state.selectedAnswerIndex,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        topic: currentQuestion.topic
      });
    },
    nextQuestion: (state) => {
      state.selectedAnswerIndex = null;
      state.isAnswerSubmitted = false;
      state.currentQuestionIndex += 1;
    },
    resetQuiz: (state) => {
      state.quizState = 'idle';
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.selectedAnswerIndex = null;
      state.isAnswerSubmitted = false;
      state.score = 0;
      state.currentAttempts = [];
      state.completedSession = null;
      state.errorMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Quiz
      .addCase(generateQuizAction.pending, (state) => {
        state.quizState = 'loading';
        state.currentQuestionIndex = 0;
        state.selectedAnswerIndex = null;
        state.isAnswerSubmitted = false;
        state.score = 0;
        state.currentAttempts = [];
        state.completedSession = null;
      })
      .addCase(generateQuizAction.fulfilled, (state, action) => {
        state.quizState = 'success';
        state.questions = action.payload.questions;
      })
      .addCase(generateQuizAction.rejected, (state, action) => {
        state.quizState = 'error';
        state.errorMessage = action.payload;
      })
      // Submit Quiz
      .addCase(submitQuizAction.fulfilled, (state, action) => {
        state.completedSession = action.payload.session;
      });
  }
});

export const {
  updateTech,
  updateDifficulty,
  updateCount,
  setSpecificTopic,
  selectAnswer,
  submitAnswer,
  nextQuestion,
  resetQuiz
} = quizSlice.actions;

export default quizSlice.reducer;
