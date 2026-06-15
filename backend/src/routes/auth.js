const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const { nameFromEmail, sendOtpEmail } = require('../utils/mailer');

const authRouter = express.Router();
const userRouter = express.Router();
const otpStore = {};

// Send OTP
authRouter.post('/otp/send', async (req, res) => {
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
authRouter.post('/verify', async (req, res) => {
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
userRouter.post('/profile', auth, async (req, res) => {
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

module.exports = {
  authRouter,
  userRouter
};
