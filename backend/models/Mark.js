const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examType: { type: String, required: true }, // e.g., 'Midterm', 'Final'
  subject: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
  totalMarks: { type: Number, default: 100 },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mark', markSchema);


