const express = require("express");
const router = express.Router();
const Attempt = require("../models/Attempt");

/* ================= SUBMIT ================= */
router.post("/submit", async (req, res) => {
  try {
    const {
      studentId,
      name,
      subject,
      score,
      totalQuestions,
      percentage
    } = req.body;

    const attempt = new Attempt({
      studentId,
      name,
      subject,
      score,
      totalQuestions,
      percentage
    });

    await attempt.save();

    res.status(200).json({ message: "Saved successfully" });

  } catch (err) {
    console.log("SUBMIT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= LEADERBOARD ================= */
router.get("/leaderboard", async (req, res) => {
  try {
    const attempts = await Attempt.find();

    const validAttempts = attempts.filter(
      (a) => a && a.percentage !== undefined && a.studentId !== undefined
    );

    const leaderboard = validAttempts.map((a) => ({
      _id: a._id,
      userId: a.studentId,
      name: a.name || "Student",
      score: a.score || 0,
      percentage: a.percentage || 0,
      subject: a.subject || "Unknown",
      createdAt: a.createdAt
    }));

    leaderboard.sort((a, b) => b.percentage - a.percentage);

    res.status(200).json({ leaderboard });

  } catch (err) {
    console.log("LEADERBOARD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE ================= */
router.delete("/attempt/:id", async (req, res) => {
  try {
    const deleted = await Attempt.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.status(200).json({ message: "Deleted permanently" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;