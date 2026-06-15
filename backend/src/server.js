require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const { authRouter, userRouter } = require('./routes/auth');
const settingsRouter = require('./routes/settings');
const quizRouter = require('./routes/quiz');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/stats', statsRouter);

// Boot Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
