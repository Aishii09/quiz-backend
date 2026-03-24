const express = require("express");
const multer = require("multer");
const AdminExam = require("../models/AdminExam");
const Result = require("../models/Result");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const router = express.Router();

/* ===============================
   CREATE UPLOAD FOLDER
================================ */
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ===============================
   MULTER CONFIG
================================ */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/* ===============================
   PARSE PDF FUNCTION
================================ */
const parseMCQs = (text) => {
  const questions = [];
  const blocks = text.split(/\n(?=\d+\.)/);

  blocks.forEach((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length < 6) return;

    const questionText = lines[0].replace(/^\d+\.\s*/, "");

    const options = [];
    let correctLetter = null;

    lines.forEach((line) => {
      if (line.startsWith("A)"))
        options.push({ text: line.replace("A)", "").trim(), isCorrect: false });
      if (line.startsWith("B)"))
        options.push({ text: line.replace("B)", "").trim(), isCorrect: false });
      if (line.startsWith("C)"))
        options.push({ text: line.replace("C)", "").trim(), isCorrect: false });
      if (line.startsWith("D)"))
        options.push({ text: line.replace("D)", "").trim(), isCorrect: false });

      if (line.startsWith("Answer:")) {
        correctLetter = line.replace("Answer:", "").trim();
      }
    });

    if (correctLetter && options.length === 4) {
      const index = ["A", "B", "C", "D"].indexOf(correctLetter);
      if (index !== -1) options[index].isCorrect = true;

      questions.push({
        question: questionText,
        options,
      });
    }
  });

  return questions;
};

/* ===============================
   UPLOAD EXAM
================================ */
router.post("/upload-exam", upload.single("file"), async (req, res) => {
  try {
    const { examType, subject } = req.body;

    if (!examType || !subject || !req.file) {
      return res.status(400).json({ message: "All fields required" });
    }

    const filePath = path.join(uploadDir, req.file.filename);
    const dataBuffer = fs.readFileSync(filePath);

    const pdfData = await pdfParse(dataBuffer);

    const generatedQuestions = parseMCQs(pdfData.text);

    if (generatedQuestions.length === 0) {
      return res.status(400).json({
        message: "No valid MCQs found in PDF. Check format.",
      });
    }

    const newExam = new AdminExam({
      examType: examType.toUpperCase(),
      subject: subject.toLowerCase(),
      filePath: req.file.filename,
      questions: generatedQuestions,
    });

    await newExam.save();

    res.status(201).json({
      message: `Upload successful. ${generatedQuestions.length} questions saved.`,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   FETCH QUESTIONS
================================ */
router.get("/exams/:examType/:subject", async (req, res) => {
  try {
    const { examType, subject } = req.params;

    const exam = await AdminExam.findOne({
      examType: examType.toUpperCase(),
      subject: subject.toLowerCase(),
    }).sort({ createdAt: -1 });

    if (!exam) {
      return res.status(404).json({ questions: [] });
    }

    const shuffled = [...exam.questions].sort(() => 0.5 - Math.random());
    const limitedQuestions = shuffled.slice(0, 15);

    res.json({ questions: limitedQuestions });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({
      message: "Failed to load questions.",
    });
  }
});

/* ===============================
   SAVE RESULT
================================ */
router.post("/save-result", async (req, res) => {
  try {
    const { examType, subject, score, totalQuestions } = req.body;

    const newResult = new Result({
      examType,
      subject,
      score,
      totalQuestions,
    });

    await newResult.save();

    res.status(201).json({
      message: "Result saved successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to save result",
    });
  }
});

module.exports = router;