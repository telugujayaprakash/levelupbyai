const express = require('express');
const Settings = require('../models/Settings');
const QuizSession = require('../models/QuizSession');
const QuestionAttempt = require('../models/QuestionAttempt');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const quizRouter = express.Router();

// Generate Quiz
quizRouter.post('/generate', auth, async (req, res) => {
  const { technology, difficulty, count, specificTopic } = req.body;
  try {
    if (!technology || !difficulty || !count) {
      return res.status(400).json({ error: 'Tech, difficulty and count are required' });
    }

    const settings = await Settings.findOne({ userId: req.user._id });
    const provider = settings?.provider || 'Gemini';
    const apiKey = settings?.apiKey || '';

    const quiz = await aiService.generateQuiz(provider, apiKey, technology, difficulty, parseInt(count), specificTopic);
    if (!quiz) {
      return res.status(500).json({ error: 'Failed to generate quiz. Check key settings or connection.' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error in /api/quiz/generate:', error);
    const errMessage = error.message || '';
    if (
      errMessage.includes('429') ||
      errMessage.toLowerCase().includes('quota') ||
      errMessage.toLowerCase().includes('limit') ||
      errMessage.toLowerCase().includes('rate')
    ) {
      return res.status(429).json({
        error: 'Your API limit has been exceeded. Please try with a different API token in Settings or wait one day.'
      });
    }
    res.status(500).json({ error: error.message || 'Failed to generate quiz.' });
  }
});

// Submit Quiz results
quizRouter.post('/submit', auth, async (req, res) => {
  const { technology, difficulty, score, totalQuestions, attempts, clientDate, specificTopic } = req.body;
  try {
    if (!technology || !difficulty || score === undefined || !totalQuestions || !attempts || !clientDate) {
      return res.status(400).json({ error: 'Missing completion arguments' });
    }

    const user = req.user;
    const now = Date.now();

    // 1. Create Quiz Session
    const session = new QuizSession({
      userId: user._id,
      technology,
      difficulty,
      score,
      totalQuestions,
      startedAt: now - 60000, // Estimate 1 min play duration
      completedAt: now,
      specificTopic
    });
    await session.save();

    // 2. Create Question Attempts
    const attemptsToInsert = attempts.map(att => ({
      userId: user._id,
      sessionId: session._id,
      question: att.question,
      selectedAnswer: att.selectedAnswer,
      correctAnswer: att.correctAnswer,
      isCorrect: att.isCorrect,
      topic: att.topic,
      createdAt: now
    }));
    await QuestionAttempt.insertMany(attemptsToInsert);

    // 3. XP & Level Update
    const correctCount = attempts.filter(att => att.isCorrect).length;
    const xpGained = (correctCount * 10) + 50 + (correctCount === totalQuestions ? 100 : 0);

    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1;

    // 4. Streak Calculation
    const parseClientDate = new Date(clientDate);
    const parseYesterday = new Date(parseClientDate.getTime() - 86400000);
    const yesterdayStr = parseYesterday.toISOString().split('T')[0];

    let updatedStreak = user.streak;
    if (user.lastActiveDate === clientDate) {
      // already practiced today
    } else if (user.lastActiveDate === yesterdayStr) {
      updatedStreak += 1;
    } else {
      updatedStreak = 1;
    }

    user.xp = newXp;
    user.level = newLevel;
    user.streak = updatedStreak;
    user.lastActiveDate = clientDate;
    await user.save();

    // 5. Evaluate achievements
    const newBadges = [];
    const allSessions = await QuizSession.find({ userId: user._id });
    const allAttempts = await QuestionAttempt.find({ userId: user._id });
    const earnedBadges = (await Achievement.find({ userId: user._id })).map(a => a.badge);

    const earnBadge = async (badgeName) => {
      if (!earnedBadges.includes(badgeName)) {
        const achievement = new Achievement({ userId: user._id, badge: badgeName });
        await achievement.save();
        newBadges.push(badgeName);
      }
    };

    // First Quiz
    if (allSessions.length >= 1) await earnBadge('First Quiz');
    // 10 Quizzes
    if (allSessions.length >= 10) await earnBadge('10 Quizzes');
    // 100 Questions
    if (allAttempts.length >= 100) await earnBadge('100 Questions');
    // 7 Day Streak
    if (user.streak >= 7) await earnBadge('7 Day Streak');

    // SQL Master
    const sqlPassedCount = allSessions.filter(s => {
      const tech = s.technology.toLowerCase();
      return (tech.includes('sql') || tech.includes('postgres') || tech.includes('mysql')) && (s.score / s.totalQuestions) >= 0.8;
    }).length;
    if (sqlPassedCount >= 3) await earnBadge('SQL Master');

    // Java Expert
    const javaPassedCount = allSessions.filter(s => {
      const tech = s.technology.toLowerCase();
      return (tech.includes('java') || tech.includes('spring')) && (s.score / s.totalQuestions) >= 0.8;
    }).length;
    if (javaPassedCount >= 3) await earnBadge('Java Expert');

    res.json({
      session,
      xpGained,
      newBadges,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        lastActiveDate: user.lastActiveDate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error processing quiz submission' });
  }
});

module.exports = quizRouter;
