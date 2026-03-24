const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  examType: String,
  subject: String,
  score: Number,
  totalQuestions: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", resultSchema);