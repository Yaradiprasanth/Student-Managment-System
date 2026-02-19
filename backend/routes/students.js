const express = require('express');
const Student = require('../models/Student');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Student self-registration (Public - no auth required)
router.post('/enroll', async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      status: 'pending'
    };
    const student = new Student(studentData);
    await student.save();
    res.status(201).json({ 
      message: 'Registration submitted successfully. Waiting for admin approval.',
      student 
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : 'Roll Number'} already exists` 
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Get all students (filter by status for non-admins, with search and filter)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    // Non-admins only see approved students
    if (req.user.role !== 'admin') {
      query.status = 'approved';
    }
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { rollNumber: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by class
    if (req.query.class) {
      query.class = req.query.class;
    }
    
    // Filter by status (admin only)
    if (req.query.status && req.user.role === 'admin') {
      query.status = req.query.status;
    }
    
    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending students (Admin only)
router.get('/pending', auth, adminOnly, async (req, res) => {
  try {
    const students = await Student.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set/Reset student password (Admin only)
router.put('/:id/set-password', auth, adminOnly, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    student.password = password;
    await student.save();
    
    res.json({ message: 'Password set successfully', student: { id: student._id, name: student.name } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve student (Admin only)
router.put('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student approved successfully', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject student (Admin only)
router.put('/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        approvedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student rejected', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk approve students (Admin only)
router.post('/bulk-approve', auth, adminOnly, async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }
    
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { 
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user.id
      }
    );
    
    res.json({ 
      message: `${result.modifiedCount} students approved successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk reject students (Admin only)
router.post('/bulk-reject', auth, adminOnly, async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }
    
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { 
        status: 'rejected',
        approvedBy: req.user.id
      }
    );
    
    res.json({ 
      message: `${result.modifiedCount} students rejected`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student statistics
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const approved = await Student.countDocuments({ status: 'approved' });
    const pending = await Student.countDocuments({ status: 'pending' });
    const rejected = await Student.countDocuments({ status: 'rejected' });
    
    // Class-wise distribution
    const classDistribution = await Student.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      total,
      approved,
      pending,
      rejected,
      classDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

