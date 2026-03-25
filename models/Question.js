const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examType: {
    type: String,
    enum: ['CET', 'NEET', 'JEE'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [
    {
      text: String,
      isCorrect: Boolean
    }
  ],
  explanation: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);