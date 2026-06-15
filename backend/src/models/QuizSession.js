const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  technology: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  startedAt: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Number,
    required: true,
  },
  specificTopic: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
