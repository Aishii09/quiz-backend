const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
});

const adminExamSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true,
    enum: ["CET", "NEET", "JEE"],
  },
  subject: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  questions: [questionSchema], // store generated MCQs
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AdminExam", adminExamSchema);
