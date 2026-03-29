const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');

const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { generateMCQsFromText } = require('../utils/mcqGenerator');

const router = express.Router();

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ storage });

/* ================= UPLOAD PDF ================= */
router.post('/upload-exam', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { examType, subject } = req.body;

    if (!examType || !subject) {
      return res.status(400).json({
        error: 'examType and subject are required.'
      });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);

    const generatedQuestions = generateMCQsFromText(pdfData.text);

    if (generatedQuestions.length === 0) {
      return res.status(400).json({
        error: 'No valid questions found in PDF.'
      });
    }

    let quiz = await Quiz.findOne({
      examType: examType.toUpperCase(),
      subject: subject.toLowerCase()
    });

    if (quiz) {
      quiz.questions = generatedQuestions;
      await quiz.save();
    } else {
      quiz = new Quiz({
        examType: examType.toUpperCase(),
        title: `${examType.toUpperCase()} - ${subject}`,
        subject: subject.toLowerCase(),
        questions: generatedQuestions,
        timeLimit: 60
      });

      await quiz.save();
    }

    res.status(200).json({
      message: 'PDF uploaded & questions generated successfully',
      totalQuestions: generatedQuestions.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

/* ================= SAVE RESULT ================= */
router.post('/save-result', async (req, res) => {
  try {
    const { userId, examType, subject, score, totalQuestions, percentage } = req.body;

    const result = new Result({
      userId,
      examType: examType.toUpperCase(),
      subject: subject.toLowerCase(),
      score,
      totalQuestions,
      percentage,
      date: new Date()
    });

    await result.save();

    res.status(200).json({
      message: 'Result saved successfully',
      result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

/* ================= GET LATEST RESULT ================= */
router.get('/result/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const latest = await Result.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({ error: 'No result found' });
    }

    res.json({ result: latest });

  } catch (error) {
    res.status(500).json({ error: 'Error fetching result' });
  }
});

/* ================= GET QUIZ ================= */
router.get('/exams/:examType/:subject', async (req, res) => {
  try {
    let { examType, subject } = req.params;

    examType = examType.toUpperCase();
    subject = subject.toLowerCase();

    const quiz = await Quiz.findOne({
      examType,
      subject
    });

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return res.json({ questions: [] });
    }

    res.json({ questions: quiz.questions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

module.exports = router;