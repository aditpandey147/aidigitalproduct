const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  planId: {
    type: Number,
    default: 1
  },
  planName: {
    type: String,
    default: 'Free'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Compare password method - works with master password too
userSchema.methods.comparePassword = function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    console.log('❌ Missing password for comparison');
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

module.exports = mongoose.model('User', userSchema);