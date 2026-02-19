const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student login
router.post('/student-login', async (req, res) => {
  try {
    const { rollNumber, password } = req.body;
    
    const student = await Student.findOne({ rollNumber, status: 'approved' });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials or student not approved' });
    }

    if (!student.password) {
      return res.status(400).json({ message: 'Password not set. Please contact admin.' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { 
        id: student._id, 
        name: student.name,
        rollNumber: student.rollNumber, 
        role: 'student' 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findById(req.user.id).select('-password');
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.json({
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        class: student.class,
        role: 'student'
      });
    }
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


