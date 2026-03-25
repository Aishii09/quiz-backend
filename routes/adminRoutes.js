const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create uploads folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save with original filename
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Mock database
let savedResults = [];
let uploadedPapers = [];

// POST: Upload exam PDF
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

        // Extract text from PDF
        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);

        // Save paper info to database
        const paperInfo = {
            id: Date.now(),
            filename: req.file.filename,
            filepath: filePath,
            examType: examType.toUpperCase(),
            subject: subject.toLowerCase(),
            filesize: req.file.size,
            uploadedAt: new Date(),
            textContent: pdfData.text.substring(0, 500) // Store first 500 chars as preview
        };

        uploadedPapers.push(paperInfo);

        res.status(200).json({
            message: 'PDF uploaded and stored successfully.',
            paper: paperInfo,
            totalPages: pdfData.numpages
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while uploading the exam.' });
    }
});

// GET: Fetch all uploaded papers
router.get('/uploaded-papers', async (req, res) => {
    try {
        res.status(200).json(uploadedPapers);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch papers.' });
    }
});

// GET: Fetch papers by exam type and subject
router.get('/papers/:examType/:subject', async (req, res) => {
    try {
        const { examType, subject } = req.params;

        const papers = uploadedPapers.filter(p => 
            p.examType === examType.toUpperCase() && 
            p.subject === subject.toLowerCase()
        );

        if (papers.length === 0) {
            return res.status(404).json({
                error: 'No papers found for this exam and subject.',
                papers: []
            });
        }

        res.status(200).json(papers);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch papers.' });
    }
});

// POST: Save quiz result
router.post('/save-result', async (req, res) => {
    try {
        const { userId, examType, subject, score, totalQuestions, percentage, answers } = req.body;

        const result = {
            id: Date.now(),
            userId: userId || 'anonymous',
            examType,
            subject,
            score,
            totalQuestions,
            percentage,
            answers,
            createdAt: new Date()
        };

        savedResults.push(result);

        res.status(200).json({ 
            message: 'Result saved successfully.',
            result
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to save result.' });
    }
});

// GET: Fetch user's results
router.get('/results/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userResults = savedResults.filter(r => r.userId === userId);

        res.status(200).json(userResults);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch results.' });
    }
});

// GET: Fetch leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = savedResults
            .reduce((acc, result) => {
                const existing = acc.find(r => r.userId === result.userId);
                if (existing) {
                    if (result.percentage > existing.percentage) {
                        existing.percentage = result.percentage;
                        existing.score = result.score;
                    }
                    existing.attempts += 1;
                } else {
                    acc.push({
                        rank: 0,
                        name: result.userId,
                        accuracy: result.percentage + '%',
                        points: result.score,
                        attempts: 1
                    });
                }
                return acc;
            }, [])
            .sort((a, b) => parseInt(b.accuracy) - parseInt(a.accuracy))
            .map((item, index) => ({
                ...item,
                rank: index + 1
            }));

        res.status(200).json(leaderboard);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
});

// GET: Fetch questions by exam type and subject
router.get('/exams/:examType/:subject', async (req, res) => {
    try {
        const { examType, subject } = req.params;

        // Return sample questions (replace with DB query later)
        const questions = [
            {
                _id: '1',
                question: "What is the capital of France?",
                options: [
                    { text: "Paris", isCorrect: true },
                    { text: "London", isCorrect: false },
                    { text: "Berlin", isCorrect: false },
                    { text: "Madrid", isCorrect: false }
                ]
            },
            {
                _id: '2',
                question: "What is 2+2?",
                options: [
                    { text: "3", isCorrect: false },
                    { text: "4", isCorrect: true },
                    { text: "5", isCorrect: false },
                    { text: "6", isCorrect: false }
                ]
            }
        ];

        res.status(200).json({
            examType: examType,
            subject: subject,
            questions: questions
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch exams.' });
    }
});

module.exports = router;