const express = require('express');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    // Only count approved students
    const totalStudents = await Student.countDocuments({ status: 'approved' });
    const pendingStudents = req.user.role === 'admin' ? await Student.countDocuments({ status: 'pending' }) : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAttendance = await Attendance.find({ 
      date: { $gte: today, $lt: tomorrow } 
    });
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    
    // Weekly attendance trend
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyAttendance = await Attendance.aggregate([
      { $match: { date: { $gte: weekStart } } },
      { $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Class-wise attendance
    const classAttendance = await Attendance.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.status': 'approved' } },
      { $group: {
        _id: '$student.class',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 }
      }}
    ]);
    
    // Pass percentage (assuming 50% is passing)
    const allMarks = await Mark.find().populate('studentId');
    const studentMarks = {};
    allMarks.forEach(mark => {
      if (mark.studentId && mark.studentId._id) {
        const id = mark.studentId._id.toString();
        if (!studentMarks[id]) {
          studentMarks[id] = { total: 0, count: 0 };
        }
        studentMarks[id].total += mark.marks;
        studentMarks[id].count += 1;
      }
    });
    
    const averages = Object.values(studentMarks).map(s => s.total / s.count);
    const passed = averages.filter(avg => avg >= 50).length;
    const passPercentage = averages.length > 0 ? (passed / averages.length * 100).toFixed(2) : 0;
    
    // Top performers
    let topPerformers = [];
    try {
      const topPerformersData = await Mark.aggregate([
        { $match: { studentId: { $exists: true, $ne: null } } },
        { $group: { _id: '$studentId', avgMarks: { $avg: '$marks' } } },
        { $sort: { avgMarks: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } }
      ]);
      
      topPerformers = topPerformersData
        .filter(t => t.student && t.student.length > 0)
        .map(t => ({
          student: t.student[0],
          average: t.avgMarks.toFixed(2)
        }));
    } catch (aggError) {
      console.error('Top performers aggregation error:', aggError);
      topPerformers = [];
    }
    
    // Recent activities (last 5 approved students)
    const recentStudents = await Student.find({ status: 'approved' })
      .sort({ approvedAt: -1 })
      .limit(5)
      .select('name rollNumber class approvedAt');
    
    res.json({
      totalStudents,
      pendingStudents,
      presentToday,
      totalToday: todayAttendance.length,
      passPercentage,
      topPerformers,
      weeklyAttendance,
      classAttendance,
      recentStudents
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

