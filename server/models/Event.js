const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  details: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Drive', 'Session', 'Booth'], 
    required: true 
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);