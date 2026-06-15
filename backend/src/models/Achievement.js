const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badge: {
    type: String,
    required: true,
  },
  earnedAt: {
    type: Number,
    default: () => Date.now(),
  }
});

// Ensure a user can only earn each badge once
AchievementSchema.index({ userId: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
