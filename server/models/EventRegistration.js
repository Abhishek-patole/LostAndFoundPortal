const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  mobile: { type: String, required: true, trim: true },
  registrationDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);