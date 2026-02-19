const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created: username=admin, password=admin123');

    // Create teacher user
    const teacher = new User({
      username: 'teacher',
      password: 'teacher123',
      role: 'teacher'
    });
    await teacher.save();
    console.log('Teacher user created: username=teacher, password=teacher123');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();


