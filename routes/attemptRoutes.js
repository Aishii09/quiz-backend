const express = require("express");
const router = express.Router();
const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");

router.post("/submit", async (req, res) => {
  try {
    const { studentId, quizId, answers } = req.body;

    if (!studentId || !quizId || !answers) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;

    for (let q of quiz.questions) {
      const submitted = answers.find(
        (a) => String(a.questionId) === String(q._id)
      );

      if (submitted && submitted.selectedAnswer === q.correctAnswer) {
        score++;
      }
    }

    const attempt = new Attempt({
      student: studentId,
      quiz: quizId,
      answers,
      score
    });

    await attempt.save();

    return res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      totalQuestions: quiz.questions.length
    });

  } catch (err) {
    console.log("SUBMIT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }

  
});




module.exports = router;
