const express = require('express');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get attendance report
router.get('/attendance', auth, async (req, res) => {
  try {
    const { startDate, endDate, class: className } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate('studentId', 'name rollNumber class')
      .sort({ date: -1 });
    
    // Filter by class if provided
    let filteredAttendance = attendance;
    if (className) {
      filteredAttendance = attendance.filter(a => 
        a.studentId && a.studentId.class === className
      );
    }
    
    res.json(filteredAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get marks report
router.get('/marks', auth, async (req, res) => {
  try {
    const { examType, class: className } = req.query;
    
    let query = {};
    if (examType) {
      query.examType = examType;
    }
    
    const marks = await Mark.find(query)
      .populate('studentId', 'name rollNumber class')
      .sort({ date: -1 });
    
    // Filter by class if provided
    let filteredMarks = marks;
    if (className) {
      filteredMarks = marks.filter(m => 
        m.studentId && m.studentId.class === className
      );
    }
    
    res.json(filteredMarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student performance report
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user has access (student can only see their own)
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const attendance = await Attendance.find({ studentId })
      .sort({ date: -1 })
      .limit(30);
    
    const marks = await Mark.find({ studentId })
      .sort({ date: -1 });
    
    // Calculate attendance percentage
    const present = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = attendance.length > 0 
      ? (present / attendance.length * 100).toFixed(2) 
      : 0;
    
    // Calculate average marks
    const totalMarks = marks.reduce((sum, m) => sum + m.marks, 0);
    const averageMarks = marks.length > 0 ? (totalMarks / marks.length).toFixed(2) : 0;
    
    res.json({
      student,
      attendance,
      marks,
      attendancePercentage,
      averageMarks,
      totalMarks: marks.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

