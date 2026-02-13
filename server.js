const connectDB = require("./config/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const quizRoutes = require("./routes/quizRoutes");


// Import routes
const authRoutes = require("./routes/authRoutes");
const attemptRoutes = require("./routes/attemptRoutes"); // add this AFTER authRoutes

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/attempt", attemptRoutes); // use attempt routes

// Test route
app.get("/", (req, res) => {
  res.send("Quiz Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
