require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const connectDB = require('./config/db');

// In-memory OTP store: email -> { code, expiresAt }
const otpStore = {};

// Helper: extract display name from email prefix
// e.g. john.doe_dev@gmail.com -> "John Doe Dev"
const nameFromEmail = (email) => {
  const local = email.split('@')[0];
  return local
    .split(/[._\-]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Helper: create nodemailer transporter (Ethereal fallback for dev)
require('dotenv').config();

const dns = require('dns');
// const nodemailer = require('nodemailer');

// Force IPv4 preference
dns.setDefaultResultOrder('ipv4first');

console.log('Node Version:', process.version);
console.log('SMTP Host:', process.env.SMTP_HOST);

const createTransporter = async () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    dns.lookup(
      process.env.SMTP_HOST,
      { all: true },
      (err, addresses) => {
        if (err) {
          console.error('DNS Lookup Error:', err);
        } else {
          console.log('DNS Records:', addresses);
        }
      }
    );


    dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
      console.log("DNS:", addresses);
    });
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      family: 4,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log('✅ SMTP VERIFIED');
    } catch (err) {
      console.error('❌ SMTP VERIFY FAILED');
      console.error(err);
      throw err;
    }

    return transporter;
  }

  console.log('⚠️ Using Ethereal fallback');

  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        '"Level Up in tech" <noreply@levelup.dev>',
      to: email,
      subject: `Your Level Up verification code: ${otp}`,
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    console.log('✅ Email sent');
    console.log(info);

    return info;
  } catch (error) {
    console.error('❌ OTP send error:', error);
    throw error;
  }
};
// const createTransporter = async () => {
//   if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
//     return nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || '587'),
//       secure: process.env.SMTP_SECURE === 'true',
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//     });
//   }
//   // Dev fallback: Ethereal test account
//   const testAccount = await nodemailer.createTestAccount();
//   return nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     auth: { user: testAccount.user, pass: testAccount.pass },
//   });
// };

// // Helper: send OTP email
// const sendOtpEmail = async (email, otp) => {
//   const transporter = await createTransporter();
//   const info = await transporter.sendMail({
//     from: process.env.SMTP_FROM || '"Level Up in tech" <noreply@levelup.dev>',
//     to: email,
//     subject: `Your Level Up verification code: ${otp}`,
//     html: `
//       <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0D0E12;border-radius:16px;border:1px solid #232733">
//         <h2 style="color:#ffffff;margin:0 0 8px">Level Up <span style="color:#4A5AF6">in tech</span></h2>
//         <p style="color:#8E9AA8;font-size:14px;margin:0 0 24px">Your one-time verification code</p>
//         <div style="background:#16181F;border:2px solid #4A5AF6;border-radius:12px;padding:24px;text-align:center">
//           <span style="color:#4A5AF6;font-size:48px;font-weight:900;letter-spacing:16px">${otp}</span>
//         </div>
//         <p style="color:#8E9AA8;font-size:12px;margin:24px 0 0">This code expires in 10 minutes. Do not share it with anyone.</p>
//       </div>
//     `,
//   });
//   // In dev, log preview URL
//   const preview = nodemailer.getTestMessageUrl(info);
//   if (preview) {
//     console.log('\n📧 OTP Email Preview:', preview);
//   }
//   console.log(`\n🔑 OTP for ${email}: ${otp}\n`);
// };

// Models
const User = require('./models/User');
const Settings = require('./models/Settings');
const QuizSession = require('./models/QuizSession');
const QuestionAttempt = require('./models/QuestionAttempt');
const Achievement = require('./models/Achievement');

// Services
const aiService = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_token_key_change_me');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Token is not valid' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// ----------------------------------------------------
// AUTH ROUTES (OTP-based)
// ----------------------------------------------------

// Send OTP
app.post('/api/auth/otp/send', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Generate 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    otpStore[normalizedEmail] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    // Send email
    await sendOtpEmail(normalizedEmail, otp);

    res.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
});

// Verify OTP & Login/Create Account
app.post('/api/auth/verify', async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const stored = otpStore[normalizedEmail];

    if (!stored) {
      return res.status(400).json({ error: 'No verification code found. Please request a new code.' });
    }
    if (Date.now() > stored.expiresAt) {
      delete otpStore[normalizedEmail];
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }
    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    }

    // OTP verified — clean up
    delete otpStore[normalizedEmail];

    let user = await User.findOne({ email: normalizedEmail });

    // Create new user if they don't exist
    if (!user) {
      const displayName = nameFromEmail(normalizedEmail);
      user = new User({
        name: displayName,
        email: normalizedEmail,
        level: 1,
        xp: 0,
        streak: 0,
        lastActiveDate: ''
      });
      await user.save();

      const settings = new Settings({ userId: user._id, provider: 'Gemini', apiKey: '' });
      await settings.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'super_secret_jwt_token_key_change_me',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, level: user.level, xp: user.xp, streak: user.streak, lastActiveDate: user.lastActiveDate }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

// Update display name (authenticated)
app.post('/api/user/profile', auth, async (req, res) => {
  const { name } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    req.user.name = name.trim();
    await req.user.save();
    res.json({ name: req.user.name });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// ----------------------------------------------------
// SETTINGS ROUTES
// ----------------------------------------------------

// Get settings
app.get('/api/settings', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = new Settings({ userId: req.user._id, provider: 'Gemini', apiKey: '' });
      await settings.save();
    }
    res.json({
      provider: settings.provider,
      apiKey: settings.apiKey
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching settings' });
  }
});

// Save settings
app.post('/api/settings', auth, async (req, res) => {
  const { provider, apiKey } = req.body;
  try {
    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    let settings = await Settings.findOne({ userId: req.user._id });
    if (settings) {
      settings.provider = provider;
      if (apiKey !== undefined) {
        settings.apiKey = apiKey;
      }
      await settings.save();
    } else {
      settings = new Settings({
        userId: req.user._id,
        provider,
        apiKey: apiKey || ''
      });
      await settings.save();
    }

    res.json({
      provider: settings.provider,
      apiKey: settings.apiKey
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error saving settings' });
  }
});

// Test connection settings
app.post('/api/settings/test', auth, async (req, res) => {
  const { provider, apiKey } = req.body;
  try {
    const success = await aiService.testConnection(provider, apiKey);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'API key verification error' });
  }
});

// ----------------------------------------------------
// QUIZ GENERATOR & GAMEPLAY
// ----------------------------------------------------

// Generate Quiz
app.post('/api/quiz/generate', auth, async (req, res) => {
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
app.post('/api/quiz/submit', auth, async (req, res) => {
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
    // Parse client date and compute client's yesterday date: YYYY-MM-DD
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

// ----------------------------------------------------
// STATS & METRICS ROUTES
// ----------------------------------------------------

// Get Dashboard
app.get('/api/stats/dashboard', auth, async (req, res) => {
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
    // Find the latest successful session (score/total >= 0.7) for each specific topic
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
      // Find tech matching this attempt from session mapping
      const matchedSession = sessions.find(s => s._id.toString() === att.sessionId.toString());
      const techName = matchedSession?.technology || 'Technology';

      const key = `${techName}|${att.topic}`;

      // If the user has passed this topic, ignore attempts created on or before the pass date
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

    // Strip out accuracy metrics to keep layout simple and lightweight
    const finalWeakAreas = weakAreas.map(item => ({
      topic: item.topic,
      technology: item.technology
    }));

    // Calculate SQL & Java high-score sessions (score / totalQuestions >= 0.8)
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
app.get('/api/stats/analytics', auth, async (req, res) => {
  try {
    const user = req.user;
    const sessions = await QuizSession.find({ userId: user._id }).sort({ completedAt: 1 });
    const attempts = await QuestionAttempt.find({ userId: user._id }).sort({ createdAt: 1 });

    // Aggregate attempts in the last 7 days for the activity curve
    // Or build a moving 7-day coordinate dataset
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

    // Technology accuracy
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

    // Difficulty accuracy
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
app.get('/api/stats/history', auth, async (req, res) => {
  try {
    const sessions = await QuizSession.find({ userId: req.user._id }).sort({ completedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error loading history' });
  }
});

// Boot Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
