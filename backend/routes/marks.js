const express = require('express');
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add marks
router.post('/', auth, async (req, res) => {
  try {
    const mark = new Mark({ ...req.body, enteredBy: req.user.id });
    await mark.save();
    res.status(201).json(mark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get marks by student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.params.studentId })
      .sort({ date: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all marks (for listing)
router.get('/student/all', auth, async (req, res) => {
  try {
    const marks = await Mark.find()
      .populate('studentId', 'name rollNumber class')
      .sort({ date: -1 });
    
    // Filter out any marks with null studentId
    const validMarks = marks.filter(mark => mark.studentId !== null);
    res.json(validMarks);
  } catch (error) {
    console.error('Get all marks error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get marks by exam
router.get('/exam/:examType', auth, async (req, res) => {
  try {
    const marks = await Mark.find({ examType: req.params.examType })
      .populate('studentId', 'name rollNumber class')
      .sort({ marks: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate grades and rank
router.get('/rank/:examType', auth, async (req, res) => {
  try {
    const marks = await Mark.find({ examType: req.params.examType })
      .populate('studentId', 'name rollNumber class');
    
    // Calculate total marks per student
    const studentTotals = {};
    marks.forEach(mark => {
      const id = mark.studentId._id.toString();
      if (!studentTotals[id]) {
        studentTotals[id] = {
          student: mark.studentId,
          total: 0,
          count: 0
        };
      }
      studentTotals[id].total += mark.marks;
      studentTotals[id].count += 1;
    });
    
    // Calculate average and grade
    const ranked = Object.values(studentTotals).map(item => ({
      student: item.student,
      average: (item.total / item.count).toFixed(2),
      grade: getGrade(item.total / item.count)
    })).sort((a, b) => b.average - a.average);
    
    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function getGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
}

module.exports = router;

