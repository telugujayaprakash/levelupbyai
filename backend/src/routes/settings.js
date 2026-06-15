const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const settingsRouter = express.Router();

// Get settings
settingsRouter.get('/', auth, async (req, res) => {
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
settingsRouter.post('/', auth, async (req, res) => {
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
settingsRouter.post('/test', auth, async (req, res) => {
  const { provider, apiKey } = req.body;
  try {
    const success = await aiService.testConnection(provider, apiKey);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'API key verification error' });
  }
});

module.exports = settingsRouter;
