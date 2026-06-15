const mongoose = require('mongoose');

const QuestionAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSession',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  selectedAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  }
});

module.exports = mongoose.model('QuestionAttempt', QuestionAttemptSchema);
