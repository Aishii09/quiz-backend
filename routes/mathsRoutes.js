const express = require("express");
const router = express.Router();

// Shuffle function
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// 60 real maths questions
const allMathsQuestions = [
    {
        question: "The value of cos 60° is?",
        options: [
            { text: "1/2", isCorrect: true },
            { text: "√3/2", isCorrect: false },
            { text: "1", isCorrect: false },
            { text: "0", isCorrect: false }
        ]
    },
    {
        question: "The derivative of sin x is?",
        options: [
            { text: "cos x", isCorrect: true },
            { text: "-cos x", isCorrect: false },
            { text: "sin x", isCorrect: false },
            { text: "-sin x", isCorrect: false }
        ]
    },
    {
        question: "The area of a circle with radius 3 is?",
        options: [
            { text: "9π", isCorrect: true },
            { text: "6π", isCorrect: false },
            { text: "3π", isCorrect: false },
            { text: "12π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of tan 45°?",
        options: [
            { text: "1", isCorrect: true },
            { text: "0", isCorrect: false },
            { text: "√3", isCorrect: false },
            { text: "1/√3", isCorrect: false }
        ]
    },
    {
        question: "The solution of equation x + 5 = 12 is?",
        options: [
            { text: "7", isCorrect: true },
            { text: "5", isCorrect: false },
            { text: "12", isCorrect: false },
            { text: "17", isCorrect: false }
        ]
    },
    {
        question: "What is the value of sin 30°?",
        options: [
            { text: "1/2", isCorrect: true },
            { text: "√3/2", isCorrect: false },
            { text: "1", isCorrect: false },
            { text: "0", isCorrect: false }
        ]
    },
    {
        question: "The derivative of x² is?",
        options: [
            { text: "2x", isCorrect: true },
            { text: "x", isCorrect: false },
            { text: "x²", isCorrect: false },
            { text: "2", isCorrect: false }
        ]
    },
    {
        question: "The perimeter of a square with side 5 is?",
        options: [
            { text: "20", isCorrect: true },
            { text: "25", isCorrect: false },
            { text: "10", isCorrect: false },
            { text: "15", isCorrect: false }
        ]
    },
    {
        question: "What is the value of log₂ 8?",
        options: [
            { text: "3", isCorrect: true },
            { text: "2", isCorrect: false },
            { text: "8", isCorrect: false },
            { text: "1", isCorrect: false }
        ]
    },
    {
        question: "The integral of 1/x is?",
        options: [
            { text: "ln|x| + C", isCorrect: true },
            { text: "x + C", isCorrect: false },
            { text: "1/x² + C", isCorrect: false },
            { text: "log x + C", isCorrect: false }
        ]
    },
    {
        question: "The value of π is approximately?",
        options: [
            { text: "3.14159", isCorrect: true },
            { text: "2.71828", isCorrect: false },
            { text: "1.61803", isCorrect: false },
            { text: "2.23607", isCorrect: false }
        ]
    },
    {
        question: "The solution of 2x - 4 = 0 is?",
        options: [
            { text: "2", isCorrect: true },
            { text: "4", isCorrect: false },
            { text: "0", isCorrect: false },
            { text: "8", isCorrect: false }
        ]
    },
    {
        question: "The area of a triangle with base 6 and height 4 is?",
        options: [
            { text: "12", isCorrect: true },
            { text: "24", isCorrect: false },
            { text: "18", isCorrect: false },
            { text: "8", isCorrect: false }
        ]
    },
    {
        question: "What is the value of e⁰?",
        options: [
            { text: "1", isCorrect: true },
            { text: "0", isCorrect: false },
            { text: "e", isCorrect: false },
            { text: "∞", isCorrect: false }
        ]
    },
    {
        question: "The derivative of cos x is?",
        options: [
            { text: "-sin x", isCorrect: true },
            { text: "sin x", isCorrect: false },
            { text: "cos x", isCorrect: false },
            { text: "-cos x", isCorrect: false }
        ]
    },
    {
        question: "The volume of a cube with side 3 is?",
        options: [
            { text: "27", isCorrect: true },
            { text: "9", isCorrect: false },
            { text: "18", isCorrect: false },
            { text: "12", isCorrect: false }
        ]
    },
    {
        question: "What is the value of √16?",
        options: [
            { text: "4", isCorrect: true },
            { text: "8", isCorrect: false },
            { text: "2", isCorrect: false },
            { text: "16", isCorrect: false }
        ]
    },
    {
        question: "The sum of angles in a triangle is?",
        options: [
            { text: "180°", isCorrect: true },
            { text: "90°", isCorrect: false },
            { text: "360°", isCorrect: false },
            { text: "270°", isCorrect: false }
        ]
    },
    {
        question: "The value of 2³ is?",
        options: [
            { text: "8", isCorrect: true },
            { text: "6", isCorrect: false },
            { text: "9", isCorrect: false },
            { text: "12", isCorrect: false }
        ]
    },
    {
        question: "The derivative of ln x is?",
        options: [
            { text: "1/x", isCorrect: true },
            { text: "x", isCorrect: false },
            { text: "ln x", isCorrect: false },
            { text: "1/x²", isCorrect: false }
        ]
    },
    {
        question: "The area of a rectangle with length 8 and width 5 is?",
        options: [
            { text: "40", isCorrect: true },
            { text: "13", isCorrect: false },
            { text: "26", isCorrect: false },
            { text: "80", isCorrect: false }
        ]
    },
    {
        question: "What is the value of sin 90°?",
        options: [
            { text: "1", isCorrect: true },
            { text: "0", isCorrect: false },
            { text: "1/2", isCorrect: false },
            { text: "√3/2", isCorrect: false }
        ]
    },
    {
        question: "The solution of x² - 9 = 0 is?",
        options: [
            { text: "±3", isCorrect: true },
            { text: "3", isCorrect: false },
            { text: "9", isCorrect: false },
            { text: "0", isCorrect: false }
        ]
    },
    {
        question: "The circumference of a circle with radius 4 is?",
        options: [
            { text: "8π", isCorrect: true },
            { text: "16π", isCorrect: false },
            { text: "4π", isCorrect: false },
            { text: "2π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of cos 0°?",
        options: [
            { text: "1", isCorrect: true },
            { text: "0", isCorrect: false },
            { text: "1/2", isCorrect: false },
            { text: "-1", isCorrect: false }
        ]
    },
    {
        question: "The derivative of eˣ is?",
        options: [
            { text: "eˣ", isCorrect: true },
            { text: "xeˣ", isCorrect: false },
            { text: "e", isCorrect: false },
            { text: "1", isCorrect: false }
        ]
    },
    {
        question: "The volume of a sphere with radius 3 is?",
        options: [
            { text: "36π", isCorrect: true },
            { text: "27π", isCorrect: false },
            { text: "18π", isCorrect: false },
            { text: "9π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of tan 0°?",
        options: [
            { text: "0", isCorrect: true },
            { text: "1", isCorrect: false },
            { text: "∞", isCorrect: false },
            { text: "-1", isCorrect: false }
        ]
    },
    {
        question: "The solution of 3x + 7 = 16 is?",
        options: [
            { text: "3", isCorrect: true },
            { text: "7", isCorrect: false },
            { text: "16", isCorrect: false },
            { text: "9", isCorrect: false }
        ]
    },
    {
        question: "The area of a trapezoid with bases 5 and 9 and height 4 is?",
        options: [
            { text: "28", isCorrect: true },
            { text: "56", isCorrect: false },
            { text: "14", isCorrect: false },
            { text: "36", isCorrect: false }
        ]
    },
    {
        question: "What is the value of log₁₀ 100?",
        options: [
            { text: "2", isCorrect: true },
            { text: "10", isCorrect: false },
            { text: "100", isCorrect: false },
            { text: "1", isCorrect: false }
        ]
    },
    {
        question: "The derivative of x³ is?",
        options: [
            { text: "3x²", isCorrect: true },
            { text: "x²", isCorrect: false },
            { text: "3x", isCorrect: false },
            { text: "x³", isCorrect: false }
        ]
    },
    {
        question: "The diagonal of a square with side 6 is?",
        options: [
            { text: "6√2", isCorrect: true },
            { text: "12", isCorrect: false },
            { text: "6", isCorrect: false },
            { text: "3√2", isCorrect: false }
        ]
    },
    {
        question: "What is the value of sin 45°?",
        options: [
            { text: "√2/2", isCorrect: true },
            { text: "1", isCorrect: false },
            { text: "1/2", isCorrect: false },
            { text: "√3/2", isCorrect: false }
        ]
    },
    {
        question: "The solution of 2x² - 8 = 0 is?",
        options: [
            { text: "±2", isCorrect: true },
            { text: "2", isCorrect: false },
            { text: "4", isCorrect: false },
            { text: "±4", isCorrect: false }
        ]
    },
    {
        question: "The surface area of a cube with side 4 is?",
        options: [
            { text: "96", isCorrect: true },
            { text: "64", isCorrect: false },
            { text: "48", isCorrect: false },
            { text: "16", isCorrect: false }
        ]
    },
    {
        question: "What is the value of cos 45°?",
        options: [
            { text: "√2/2", isCorrect: true },
            { text: "1", isCorrect: false },
            { text: "0", isCorrect: false },
            { text: "1/2", isCorrect: false }
        ]
    },
    {
        question: "The derivative of √x is?",
        options: [
            { text: "1/(2√x)", isCorrect: true },
            { text: "√x", isCorrect: false },
            { text: "2√x", isCorrect: false },
            { text: "1/√x", isCorrect: false }
        ]
    },
    {
        question: "The volume of a cylinder with radius 3 and height 5 is?",
        options: [
            { text: "45π", isCorrect: true },
            { text: "15π", isCorrect: false },
            { text: "30π", isCorrect: false },
            { text: "75π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of tan 30°?",
        options: [
            { text: "1/√3", isCorrect: true },
            { text: "√3", isCorrect: false },
            { text: "1", isCorrect: false },
            { text: "0", isCorrect: false }
        ]
    },
    {
        question: "The solution of x/3 = 6 is?",
        options: [
            { text: "18", isCorrect: true },
            { text: "6", isCorrect: false },
            { text: "3", isCorrect: false },
            { text: "9", isCorrect: false }
        ]
    },
    {
        question: "The area of a rhombus with diagonals 8 and 6 is?",
        options: [
            { text: "24", isCorrect: true },
            { text: "48", isCorrect: false },
            { text: "12", isCorrect: false },
            { text: "36", isCorrect: false }
        ]
    },
    {
        question: "What is the value of log₃ 27?",
        options: [
            { text: "3", isCorrect: true },
            { text: "9", isCorrect: false },
            { text: "27", isCorrect: false },
            { text: "1", isCorrect: false }
        ]
    },
    {
        question: "The derivative of 1/x is?",
        options: [
            { text: "-1/x²", isCorrect: true },
            { text: "1/x²", isCorrect: false },
            { text: "-1/x", isCorrect: false },
            { text: "2/x", isCorrect: false }
        ]
    },
    {
        question: "The hypotenuse of a right triangle with legs 5 and 12 is?",
        options: [
            { text: "13", isCorrect: true },
            { text: "17", isCorrect: false },
            { text: "10", isCorrect: false },
            { text: "15", isCorrect: false }
        ]
    },
    {
        question: "What is the value of sin 60°?",
        options: [
            { text: "√3/2", isCorrect: true },
            { text: "1/2", isCorrect: false },
            { text: "√2/2", isCorrect: false },
            { text: "1", isCorrect: false }
        ]
    },
    {
        question: "The solution of |x - 3| = 5 is?",
        options: [
            { text: "8 or -2", isCorrect: true },
            { text: "8", isCorrect: false },
            { text: "-2", isCorrect: false },
            { text: "3", isCorrect: false }
        ]
    },
    {
        question: "The area of a regular hexagon with side 4 is?",
        options: [
            { text: "24√3", isCorrect: true },
            { text: "12√3", isCorrect: false },
            { text: "48√3", isCorrect: false },
            { text: "36√3", isCorrect: false }
        ]
    },
    {
        question: "What is the value of 5!?",
        options: [
            { text: "120", isCorrect: true },
            { text: "25", isCorrect: false },
            { text: "60", isCorrect: false },
            { text: "720", isCorrect: false }
        ]
    },
    {
        question: "The derivative of tan x is?",
        options: [
            { text: "sec² x", isCorrect: true },
            { text: "cos² x", isCorrect: false },
            { text: "sin² x", isCorrect: false },
            { text: "tan² x", isCorrect: false }
        ]
    },
    {
        question: "The volume of a cone with radius 3 and height 4 is?",
        options: [
            { text: "12π", isCorrect: true },
            { text: "36π", isCorrect: false },
            { text: "24π", isCorrect: false },
            { text: "48π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of cos 120°?",
        options: [
            { text: "-1/2", isCorrect: true },
            { text: "1/2", isCorrect: false },
            { text: "-√3/2", isCorrect: false },
            { text: "√3/2", isCorrect: false }
        ]
    },
    {
        question: "The solution of 2ˣ = 16 is?",
        options: [
            { text: "4", isCorrect: true },
            { text: "8", isCorrect: false },
            { text: "2", isCorrect: false },
            { text: "16", isCorrect: false }
        ]
    },
    {
        question: "The area of a sector with angle 60° and radius 6 is?",
        options: [
            { text: "6π", isCorrect: true },
            { text: "12π", isCorrect: false },
            { text: "3π", isCorrect: false },
            { text: "18π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of sin 120°?",
        options: [
            { text: "√3/2", isCorrect: true },
            { text: "1/2", isCorrect: false },
            { text: "-√3/2", isCorrect: false },
            { text: "-1/2", isCorrect: false }
        ]
    },
    {
        question: "The solution of x² + 4x + 4 = 0 is?",
        options: [
            { text: "-2", isCorrect: true },
            { text: "2", isCorrect: false },
            { text: "4", isCorrect: false },
            { text: "-4", isCorrect: false }
        ]
    },
    {
        question: "The surface area of a sphere with radius 2 is?",
        options: [
            { text: "16π", isCorrect: true },
            { text: "8π", isCorrect: false },
            { text: "4π", isCorrect: false },
            { text: "32π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of tan 60°?",
        options: [
            { text: "√3", isCorrect: true },
            { text: "1/√3", isCorrect: false },
            { text: "1", isCorrect: false },
            { text: "0", isCorrect: false }
        ]
    },
    {
        question: "The solution of log₂ x = 5 is?",
        options: [
            { text: "32", isCorrect: true },
            { text: "10", isCorrect: false },
            { text: "25", isCorrect: false },
            { text: "2", isCorrect: false }
        ]
    },
    {
        question: "The area of a circle with diameter 10 is?",
        options: [
            { text: "25π", isCorrect: true },
            { text: "10π", isCorrect: false },
            { text: "5π", isCorrect: false },
            { text: "100π", isCorrect: false }
        ]
    },
    {
        question: "What is the value of cos 90°?",
        options: [
            { text: "0", isCorrect: true },
            { text: "1", isCorrect: false },
            { text: "-1", isCorrect: false },
            { text: "1/2", isCorrect: false }
        ]
    },
    {
        question: "The derivative of sin 2x is?",
        options: [
            { text: "2 cos 2x", isCorrect: true },
            { text: "cos 2x", isCorrect: false },
            { text: "sin 2x", isCorrect: false },
            { text: "2 sin 2x", isCorrect: false }
        ]
    },
    {
        question: "The volume of a pyramid with base area 12 and height 5 is?",
        options: [
            { text: "20", isCorrect: true },
            { text: "60", isCorrect: false },
            { text: "30", isCorrect: false },
            { text: "15", isCorrect: false }
        ]
    },
    {
        question: "What is the value of sin 0°?",
        options: [
            { text: "0", isCorrect: true },
            { text: "1", isCorrect: false },
            { text: "-1", isCorrect: false },
            { text: "1/2", isCorrect: false }
        ]
    },
    {
        question: "The solution of x² - 6x + 9 = 0 is?",
        options: [
            { text: "3", isCorrect: true },
            { text: "9", isCorrect: false },
            { text: "6", isCorrect: false },
            { text: "0", isCorrect: false }
        ]
    },
    {
        question: "The perimeter of a circle with radius 7 is?",
        options: [
            { text: "14π", isCorrect: true },
            { text: "7π", isCorrect: false },
            { text: "28π", isCorrect: false },
            { text: "21π", isCorrect: false }
        ]
    }
];

// GET: Fetch maths questions by exam type
router.get('/:examId', (req, res) => {
    try {
        const { examId } = req.params;
        const exam = examId.toUpperCase();

        console.log("Maths Exam:", exam);
        console.log("Total Maths Questions:", allMathsQuestions.length);

        // Shuffle questions and options
        const shuffledQuestions = shuffleArray([...allMathsQuestions]).map(q => ({
            ...q,
            options: shuffleArray([...q.options])
        }));

        res.json({
            exam: exam,
            subject: "maths",
            questions: shuffledQuestions
        });

    } catch (error) {
        console.error('Error fetching maths questions:', error);
        res.status(500).json({ error: 'Failed to fetch maths questions' });
    }
});

module.exports = router;
