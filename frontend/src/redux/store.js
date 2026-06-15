const { configureStore } = require('@reduxjs/toolkit');
const authReducer = require('./authSlice').default;
const quizReducer = require('./quizSlice').default;

const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
