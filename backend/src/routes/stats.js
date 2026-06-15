const express = require('express');
const QuizSession = require('../models/QuizSession');
const QuestionAttempt = require('../models/QuestionAttempt');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const auth = require('../middleware/auth');

const statsRouter = express.Router();

// Get Dashboard
statsRouter.get('/dashboard', auth, async (req, res) => {
  try {
    const user = req.user;

    // Check and reset streak if they missed a calendar day (difference > 1)
    const clientDate = req.query.clientDate || new Date().toISOString().split('T')[0];
    if (user.streak > 0 && user.lastActiveDate) {
      const d1 = new Date(clientDate);
      const d2 = new Date(user.lastActiveDate);
      const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        user.streak = 0;
        await user.save();
      }
    }

    const sessions = await QuizSession.find({ userId: user._id }).sort({ completedAt: -1 });
    const attempts = await QuestionAttempt.find({ userId: user._id }).sort({ createdAt: -1 });
    const achievements = await Achievement.find({ userId: user._id }).sort({ earnedAt: -1 });

    const totalQuestions = attempts.length;
    const totalQuizzes = sessions.length;
    const accuracy = totalQuestions > 0
      ? Math.round((attempts.filter(a => a.isCorrect).length / totalQuestions) * 100)
      : 0;

    // Get recent technologies (last 4 unique ones)
    const recentTechs = [...new Set(sessions.map(s => s.technology))].slice(0, 4);

    // Calculate weak areas (topic accuracy < 80%)
    const latestPassMap = {}; // key: "tech|topic" -> date object
    sessions.forEach(s => {
      if (s.specificTopic && (s.score / s.totalQuestions) >= 0.7) {
        const key = `${s.technology}|${s.specificTopic}`;
        const date = new Date(s.completedAt);
        if (!latestPassMap[key] || date > latestPassMap[key]) {
          latestPassMap[key] = date;
        }
      }
    });

    const topicGroups = {};
    attempts.forEach(att => {
      const matchedSession = sessions.find(s => s._id.toString() === att.sessionId.toString());
      const techName = matchedSession?.technology || 'Technology';

      const key = `${techName}|${att.topic}`;

      const passDate = latestPassMap[key];
      if (passDate && new Date(att.createdAt) <= passDate) {
        return; // Skip this attempt
      }

      if (!topicGroups[key]) {
        topicGroups[key] = { tech: techName, topic: att.topic, corrects: 0, total: 0 };
      }
      topicGroups[key].total += 1;
      if (att.isCorrect) {
        topicGroups[key].corrects += 1;
      }
    });

    const weakAreas = [];
    Object.values(topicGroups).forEach(group => {
      const acc = Math.round((group.corrects / group.total) * 100);
      if (acc < 80) {
        weakAreas.push({
          topic: group.topic,
          technology: group.tech,
          accuracy: acc
        });
      }
    });
    weakAreas.sort((a, b) => a.accuracy - b.accuracy);

    const finalWeakAreas = weakAreas.map(item => ({
      topic: item.topic,
      technology: item.technology
    }));

    const sqlPassedCount = sessions.filter(s => {
      const tech = s.technology.toLowerCase();
      return (tech.includes('sql') || tech.includes('postgres') || tech.includes('mysql')) && (s.score / s.totalQuestions) >= 0.8;
    }).length;

    const javaPassedCount = sessions.filter(s => {
      const tech = s.technology.toLowerCase();
      return (tech.includes('java') || tech.includes('spring')) && (s.score / s.totalQuestions) >= 0.8;
    }).length;

    const achievementsProgress = [
      {
        name: 'First Quiz',
        desc: 'Completed your first AI practice quiz',
        icon: '🥇',
        current: Math.min(1, sessions.length),
        target: 1
      },
      {
        name: '10 Quizzes',
        desc: 'Completed 10 comprehensive quizzes',
        icon: '🏆',
        current: Math.min(10, sessions.length),
        target: 10
      },
      {
        name: '100 Questions',
        desc: 'Answered 100 questions fully',
        icon: '🧠',
        current: Math.min(100, attempts.length),
        target: 100
      },
      {
        name: '7 Day Streak',
        desc: 'Completed quizzes 7 days in a row',
        icon: '🔥',
        current: Math.min(7, user.streak),
        target: 7
      },
      {
        name: 'SQL Master',
        desc: 'Earned 80%+ score on 3 SQL practices',
        icon: '💾',
        current: Math.min(3, sqlPassedCount),
        target: 3
      },
      {
        name: 'Java Expert',
        desc: 'Earned 80%+ score on 3 Java practices',
        icon: '⚡',
        current: Math.min(3, javaPassedCount),
        target: 3
      }
    ];

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        lastActiveDate: user.lastActiveDate
      },
      stats: {
        totalQuizzes,
        totalQuestions,
        accuracy
      },
      recentTechs,
      weakAreas: finalWeakAreas,
      achievements,
      achievementsProgress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error loading dashboard stats' });
  }
});

// Get Analytics
statsRouter.get('/analytics', auth, async (req, res) => {
  try {
    const user = req.user;
    const sessions = await QuizSession.find({ userId: user._id }).sort({ completedAt: 1 });
    const attempts = await QuestionAttempt.find({ userId: user._id }).sort({ createdAt: 1 });

    const dailyCounts = Array(7).fill(0);
    const dayLabels = [];
    const oneDay = 86400000;
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * oneDay);
      dayLabels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));

      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + oneDay;

      const count = attempts.filter(att => att.createdAt >= startOfDay && att.createdAt < endOfDay).length;
      dailyCounts[6 - i] = count;
    }

    const techGroups = {};
    attempts.forEach(att => {
      const session = sessions.find(s => s._id.toString() === att.sessionId.toString());
      const tech = session?.technology || 'JavaScript';
      if (!techGroups[tech]) {
        techGroups[tech] = { corrects: 0, total: 0 };
      }
      techGroups[tech].total += 1;
      if (att.isCorrect) techGroups[tech].corrects += 1;
    });

    const techStats = Object.keys(techGroups).map(tech => ({
      tech,
      accuracy: Math.round((techGroups[tech].corrects / techGroups[tech].total) * 100),
      totalQuestions: techGroups[tech].total
    })).sort((a, b) => b.totalQuestions - a.totalQuestions);

    const diffGroups = {};
    attempts.forEach(att => {
      const session = sessions.find(s => s._id.toString() === att.sessionId.toString());
      const diff = session?.difficulty || 'Intermediate';
      if (!diffGroups[diff]) {
        diffGroups[diff] = { corrects: 0, total: 0 };
      }
      diffGroups[diff].total += 1;
      if (att.isCorrect) diffGroups[diff].corrects += 1;
    });

    const difficulties = ['Foundation', 'Basic', 'Intermediate', 'Hard', 'Advanced'];
    const diffStats = difficulties.map(diff => {
      const stats = diffGroups[diff] || { corrects: 0, total: 0 };
      return {
        difficulty: diff,
        accuracy: stats.total > 0 ? Math.round((stats.corrects / stats.total) * 100) : 0,
        totalQuestions: stats.total
      };
    });

    res.json({
      activityGraph: {
        labels: dayLabels,
        data: dailyCounts
      },
      techStats,
      diffStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error loading analytics stats' });
  }
});

// Get History
statsRouter.get('/history', auth, async (req, res) => {
  try {
    const sessions = await QuizSession.find({ userId: req.user._id }).sort({ completedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error loading history' });
  }
});

module.exports = statsRouter;
