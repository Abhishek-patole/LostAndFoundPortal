// createAdmin.js

// Load environment variables from .env file
require('dotenv').config({ path: './.env' });

// Import dependencies
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('-----------------------------------');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('-----------------------------------');
      process.exit(0);
    }

    // Create new admin user
    const admin = new User({
      fullname: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      password: 'admin123'
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('-----------------------------------');
    console.log('You can now login at: http://localhost:5000/admin-login.html');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
