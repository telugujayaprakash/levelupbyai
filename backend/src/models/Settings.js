const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  provider: {
    type: String,
    enum: ['Gemini', 'OpenAI'],
    default: 'Gemini',
  },
  apiKey: {
    type: String,
    default: '',
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
