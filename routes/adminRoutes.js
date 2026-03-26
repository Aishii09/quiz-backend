const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { generateMCQsFromText } = require('../utils/mcqGenerator');

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

        // Generate MCQs from PDF text
        const generatedQuestions = generateMCQsFromText(pdfData.text);
        console.log(`Generated ${generatedQuestions.length} questions from PDF`);

        // Find existing quiz or create new one
        let quiz = await Quiz.findOne({
            examType: examType.toUpperCase(),
            subject: subject.toLowerCase()
        });

        if (quiz) {
            // Append new questions to existing quiz
            quiz.questions.push(...generatedQuestions);
            await quiz.save();
            console.log(`Appended ${generatedQuestions.length} questions to existing quiz for ${examType.toUpperCase()} ${subject.toLowerCase()}`);
        } else {
            // Create new quiz with questions
            quiz = new Quiz({
                examType: examType.toUpperCase(),
                title: `${examType.toUpperCase()} - ${subject.charAt(0).toUpperCase() + subject.slice(1)}`,
                subject: subject.toLowerCase(),
                questions: generatedQuestions,
                pdfFile: req.file.filename,
                timeLimit: 60
            });
            await quiz.save();
            console.log(`Created new quiz for ${examType.toUpperCase()} ${subject.toLowerCase()} with ${generatedQuestions.length} questions`);
        }

        // Save paper info to database
        const paperInfo = {
            id: Date.now(),
            filename: req.file.filename,
            filepath: filePath,
            examType: examType.toUpperCase(),
            subject: subject.toLowerCase(),
            filesize: req.file.size,
            uploadedAt: new Date(),
            textContent: pdfData.text.substring(0, 500),
            questionsGenerated: generatedQuestions.length
        };

        uploadedPapers.push(paperInfo);

        res.status(200).json({
            message: 'PDF uploaded and MCQs generated successfully.',
            paper: paperInfo,
            totalPages: pdfData.numpages,
            questionsGenerated: generatedQuestions.length
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

        const result = new Result({
            userId: userId || 'anonymous',
            examType: examType.toUpperCase(),
            subject: subject.toLowerCase(),
            score: parseInt(score),
            totalQuestions: parseInt(totalQuestions),
            percentage: parseFloat(percentage),
            date: new Date(),
            answers: answers || []
        });

        await result.save();
        console.log(`Result saved: ${userId} - ${examType} ${subject} - ${score}/${totalQuestions} (${percentage}%)`);

        res.status(200).json({ 
            message: 'Result saved successfully.',
            result: {
                id: result._id,
                userId: result.userId,
                examType: result.examType,
                subject: result.subject,
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: result.percentage,
                date: result.date
            }
        });

    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ error: 'Failed to save result.' });
    }
});

// GET: Fetch latest result for user
router.get('/result/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const latestResult = await Result.findOne({ userId })
            .sort({ createdAt: -1 })
            .limit(1);
        
        if (latestResult) {
            res.status(200).json({
                success: true,
                result: {
                    userId: latestResult.userId,
                    examType: latestResult.examType,
                    subject: latestResult.subject,
                    score: latestResult.score,
                    totalQuestions: latestResult.totalQuestions,
                    percentage: latestResult.percentage,
                    date: latestResult.date
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No result found for this user'
            });
        }
    } catch (error) {
        console.error('Error fetching user result:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch user result' 
        });
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

// GET: Fetch leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { examType, subject } = req.query;
        
        let query = {};
        if (examType && examType !== 'all') {
            query.examType = examType.toUpperCase();
        }
        if (subject && subject !== 'all') {
            query.subject = subject.toLowerCase();
        }
        
        // Fetch all results matching filters
        const results = await Result.find(query)
            .sort({ percentage: -1, date: -1 })
            .limit(100);
        
        // Group by user and get best scores
        const userBestScores = {};
        results.forEach(result => {
            const key = `${result.userId}_${result.examType}_${result.subject}`;
            if (!userBestScores[key] || result.percentage > userBestScores[key].percentage) {
                userBestScores[key] = result;
            }
        });
        
        // Convert to array and sort by percentage
        const leaderboard = Object.values(userBestScores)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 50); // Top 50
        
        res.status(200).json({
            success: true,
            leaderboard: leaderboard.map((result, index) => ({
                rank: index + 1,
                userId: result.userId,
                examType: result.examType,
                subject: result.subject,
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: result.percentage,
                date: result.date
            })),
            total: leaderboard.length
        });
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch leaderboard' 
        });
    }
});

// DELETE: Delete all quizzes (for testing)
router.delete('/delete-all-quizzes', async (req, res) => {
    try {
        await Quiz.deleteMany({});
        console.log('All quizzes deleted from database');
        res.status(200).json({ message: 'All quizzes deleted successfully' });
    } catch (error) {
        console.error('Error deleting quizzes:', error);
        res.status(500).json({ error: 'Failed to delete quizzes' });
    }
});

// POST: Create real JEE Physics questions manually
router.post('/create-real-phy-questions', async (req, res) => {
    try {
        const realQuestions = [
            {
                question: "A particle moves such that its velocity is proportional to displacement. The motion is",
                options: [
                    { text: "Uniform", isCorrect: false },
                    { text: "SHM", isCorrect: true },
                    { text: "Circular", isCorrect: false },
                    { text: "Random", isCorrect: false }
                ]
            },
            {
                question: "If acceleration is zero, velocity is",
                options: [
                    { text: "Zero", isCorrect: false },
                    { text: "Constant", isCorrect: true },
                    { text: "Increasing", isCorrect: false },
                    { text: "Decreasing", isCorrect: false }
                ]
            },
            {
                question: "Work done by friction is always",
                options: [
                    { text: "Positive", isCorrect: false },
                    { text: "Negative", isCorrect: true },
                    { text: "Zero", isCorrect: false },
                    { text: "Infinite", isCorrect: false }
                ]
            },
            {
                question: "A body in equilibrium has",
                options: [
                    { text: "Net force zero", isCorrect: false },
                    { text: "Net torque zero", isCorrect: false },
                    { text: "Both", isCorrect: true },
                    { text: "None", isCorrect: false }
                ]
            },
            {
                question: "If force is doubled, acceleration becomes",
                options: [
                    { text: "Half", isCorrect: false },
                    { text: "Double", isCorrect: true },
                    { text: "Same", isCorrect: false },
                    { text: "Zero", isCorrect: false }
                ]
            }
        ];

        // Create 60 questions by repeating and varying
        const allQuestions = [];
        for (let i = 0; i < 60; i++) {
            const baseQuestion = realQuestions[i % realQuestions.length];
            allQuestions.push({
                ...baseQuestion,
                question: i < realQuestions.length ? baseQuestion.question : `${baseQuestion.question} (Q${i + 1})`
            });
        }

        const quiz = new Quiz({
            examType: "JEE",
            title: "JEE - Physics",
            subject: "physics",
            questions: allQuestions,
            timeLimit: 60
        });
        
        await quiz.save();
        console.log(`Created real JEE Physics quiz with ${allQuestions.length} questions`);
        
        res.status(200).json({
            message: 'Real JEE Physics questions created successfully',
            quiz: {
                examType: quiz.examType,
                subject: quiz.subject,
                questionCount: quiz.questions.length,
                title: quiz.title
            }
        });
    } catch (error) {
        console.error('Error creating real questions:', error);
        res.status(500).json({ error: 'Failed to create real questions', details: error.message });
    }
});

// POST: Create test quiz manually
router.post('/create-test-quiz', async (req, res) => {
    try {
        const { examType, subject } = req.body;
        
        // Create sample questions
        const sampleQuestions = [];
        for (let i = 0; i < 60; i++) {
            sampleQuestions.push({
                question: `Sample question ${i + 1} for ${subject}?`,
                options: [
                    { text: `Option A for question ${i + 1}`, isCorrect: true },
                    { text: `Option B for question ${i + 1}`, isCorrect: false },
                    { text: `Option C for question ${i + 1}`, isCorrect: false },
                    { text: `Option D for question ${i + 1}`, isCorrect: false }
                ]
            });
        }
        
        const quiz = new Quiz({
            examType: examType.toUpperCase(),
            title: `${examType.toUpperCase()} - ${subject.charAt(0).toUpperCase() + subject.slice(1)} (Test)`,
            subject: subject.toLowerCase(),
            questions: sampleQuestions,
            timeLimit: 60
        });
        
        await quiz.save();
        console.log(`Created test quiz for ${examType.toUpperCase()} ${subject.toLowerCase()} with ${sampleQuestions.length} questions`);
        
        res.status(200).json({
            message: 'Test quiz created successfully',
            quiz: {
                examType: quiz.examType,
                subject: quiz.subject,
                questionCount: quiz.questions.length,
                title: quiz.title
            }
        });
    } catch (error) {
        console.error('Error creating test quiz:', error);
        res.status(500).json({ error: 'Failed to create test quiz', details: error.message });
    }
});

// GET: Test database connection and list all quizzes
router.get('/test-db', async (req, res) => {
    try {
        const allQuizzes = await Quiz.find({});
        console.log('All quizzes in database:', allQuizzes.length);
        
        res.status(200).json({
            message: 'Database connection working',
            totalQuizzes: allQuizzes.length,
            quizzes: allQuizzes.map(q => ({
                examType: q.examType,
                subject: q.subject,
                questionCount: q.questions.length,
                title: q.title
            }))
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// GET: Fetch questions by exam type and subject
router.get('/exams/:examType/:subject', async (req, res) => {
    try {
        const { examType, subject } = req.params;
        
        console.log(`Fetching questions for examType: ${examType}, subject: ${subject}`);

        // Simple query - exact match
        const quiz = await Quiz.findOne({
            examType: examType.toUpperCase(),
            subject: subject.toLowerCase()
        });

        console.log("Found Quiz:", quiz ? "Yes" : "No");
        if (quiz) {
            console.log("Quiz questions count:", quiz.questions.length);
            console.log("First question:", quiz.questions[0]?.question?.substring(0, 50));
        }

        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            console.log("No quiz found or empty questions");
            return res.status(200).json({
                examType: examType,
                subject: subject,
                questions: []
            });
        }

        // Take only first 60 questions
        const limitedQuestions = quiz.questions.slice(0, 60);

        console.log(`Returning ${limitedQuestions.length} questions`);

        res.status(200).json({
            examType: examType,
            subject: subject,
            questions: limitedQuestions
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch exams.' });
    }
});

module.exports = router;