const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    timeLimit: {
      type: Number
    },
    createdBy: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
