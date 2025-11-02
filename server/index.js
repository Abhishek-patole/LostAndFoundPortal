require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 5001;


// Middleware
app.use(cors()); // adjust origin as needed for security
app.use(express.json()); // parse JSON bodies

// Serve static frontend (your HTML/CSS)
// Adjusted path - public folder is at same level as server folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);

// Fallback for single-page or file not found
app.use((req, res, next) => {
  // if request is for API and not found:
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  // otherwise serve index or the requested file from public
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('--- !!! DATABASE CONNECTION FAILED !!! ---'); // <-- ADD THIS
  console.error(err);                                    // <-- ADD THIS
  process.exit(1);                                       // <-- ADD THIS
});