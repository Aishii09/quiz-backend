const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    examType: {
      type: String,
      required: true,   // CET / JEE / NEET
    },

    title: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
      },
    ],

    pdfFile: {
      type: String, // stored filename if uploaded
    },

    timeLimit: {
      type: Number,
      default: 60,
    },

    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
