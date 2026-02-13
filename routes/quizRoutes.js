const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");

// CREATE QUIZ
router.post("/create", async (req, res) => {
  const { title, subject, questions, timeLimit, createdBy } = req.body;
  if (!title || !subject || !questions) return res.status(400).json({ message: "Fill all required fields" });

  try {
    const quiz = new Quiz({ title, subject, questions, timeLimit, createdBy });
    await quiz.save();
    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// GET ALL QUIZZES
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
