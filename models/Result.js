const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'anonymous'
  },
  examType: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  answers: [{
    questionId: String,
    selectedOption: String,
    isCorrect: Boolean
  }]
});

module.exports = mongoose.model("Result", resultSchema);