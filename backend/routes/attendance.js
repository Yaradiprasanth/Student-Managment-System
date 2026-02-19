const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mark attendance
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    
    const attendance = await Attendance.findOneAndUpdate(
      { studentId, date: new Date(date) },
      { studentId, date: new Date(date), status, markedBy: req.user.id },
      { upsert: true, new: true }
    );
    
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk mark attendance
router.post('/bulk', auth, async (req, res) => {
  try {
    const { attendances, date } = req.body; // attendances: [{studentId, status}]
    
    if (!Array.isArray(attendances) || attendances.length === 0) {
      return res.status(400).json({ message: 'Attendances array is required' });
    }
    
    const attendanceDate = new Date(date);
    const operations = attendances.map(att => ({
      updateOne: {
        filter: { studentId: att.studentId, date: attendanceDate },
        update: {
          studentId: att.studentId,
          date: attendanceDate,
          status: att.status,
          markedBy: req.user.id
        },
        upsert: true
      }
    }));
    
    await Attendance.bulkWrite(operations);
    
    res.json({ message: `${attendances.length} attendance records saved successfully` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance by date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const attendance = await Attendance.find({ 
      date: { $gte: startOfDay, $lte: endOfDay } 
    })
      .populate('studentId', 'name rollNumber class');
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get student attendance
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId })
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly report
router.get('/monthly/:studentId/:month/:year', auth, async (req, res) => {
  try {
    const { studentId, month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await Attendance.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const present = attendance.filter(a => a.status === 'present').length;
    const total = attendance.length;
    const percentage = total > 0 ? (present / total * 100).toFixed(2) : 0;
    
    res.json({ present, absent: total - present, total, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

