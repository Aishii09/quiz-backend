const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: "Student"
  },
  subject: {
    type: String,
    default: "Unknown"
  },
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Attempt", attemptSchema);