const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const pdf = require("pdf-parse");

const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const Student = require("../models/User"); // ✅ correct model
const { generateMCQsFromText } = require("../utils/mcqGenerator");

const router = express.Router();

/* ================= MULTER SETUP ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/* ================= UPLOAD PDF ================= */

router.post("/upload-exam", upload.single("file"), async (req, res) => {
  try {
    const { examType, subject } = req.body;

    if (!req.file || !examType || !subject) {
      return res.status(400).json({ error: "Missing file or fields" });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);

    const questions = generateMCQsFromText(pdfData.text);

    if (!questions.length) {
      return res.status(400).json({
        error: "No valid questions found in PDF",
      });
    }

    let quiz = await Quiz.findOne({
      examType: examType.toUpperCase(),
      subject: subject.toLowerCase(),
    });

    if (quiz) {
      quiz.questions = questions;
      await quiz.save();
    } else {
      quiz = new Quiz({
        examType: examType.toUpperCase(),
        title: `${examType} - ${subject}`,
        subject: subject.toLowerCase(),
        questions,
        timeLimit: 60,
      });

      await quiz.save();
    }

    res.json({
      message: "PDF uploaded and questions saved",
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ================= GET QUESTIONS ================= */

router.get("/exams/:examType/:subject", async (req, res) => {
  try {
    let { examType, subject } = req.params;

    examType = examType.toUpperCase();
    subject = subject.toLowerCase();

    let subjectQuery;
    if (subject === "maths" || subject === "mathematics") {
      subjectQuery = { $in: ["maths", "mathematics"] };
    } else {
      subjectQuery = subject;
    }

    const quiz = await Quiz.findOne({
      examType: examType,
      subject: subjectQuery,
    });

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return res.json({ questions: [] });
    }

    res.json({ questions: quiz.questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= SAVE RESULT ================= */

router.post("/save-result", async (req, res) => {
  try {
    const {
      userId,
      examType,
      subject,
      score,
      totalQuestions,
      percentage,
      answers,
    } = req.body;

    const result = new Result({
      userId: userId || "anonymous",
      examType: examType.toUpperCase(),
      subject: subject.toLowerCase(),
      score,
      totalQuestions,
      percentage,
      answers,
      date: new Date(),
    });

    await result.save();

    res.json({ message: "Result saved successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save result" });
  }
});

/* ================= GET LATEST RESULT ================= */

/* ================= GET LATEST RESULT ================= */

router.get("/result/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ latest result
    const latest = await Result.findOne({ userId: userId }).sort({ date: -1 });

    // ✅ FIXED: use name instead of _id
    let student = null;
    if (userId && userId !== "anonymous") {
      student = await Student.findOne({ name: userId });
    }

    res.json({
      result: latest || null,
      student: {
        name: student?.name || userId || "Student",
      },
    });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ================= LEADERBOARD ================= */

router.get("/leaderboard", async (req, res) => {
  try {
    const results = await Result.find()
      .sort({ percentage: -1, date: -1 })
      .limit(50);

    const leaderboard = results.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      examType: r.examType,
      subject: r.subject,
      score: r.score,
      percentage: r.percentage,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

/* ================= TEST DB ================= */

router.get("/test-db", async (req, res) => {
  try {
    const Quiz = require("../models/Quiz");

    const allQuizzes = await Quiz.find();

    res.json({
      message: "Database working",
      totalQuizzes: allQuizzes.length,
      quizzes: allQuizzes.map((q) => ({
        examType: q.examType,
        subject: q.subject,
        questionCount: q.questions.length,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;