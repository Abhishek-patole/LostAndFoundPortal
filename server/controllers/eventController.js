const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, name, email, mobile } = req.body;

    if (!eventId || !name || !email || !mobile) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number. Must be 10 digits.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: 'Event is no longer active' });
    }

    const existing = await EventRegistration.findOne({ eventId, email });
    if (existing) {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    const registration = new EventRegistration({ eventId, name, email, mobile });
    await registration.save();

    return res.status(201).json({ 
      message: 'Successfully registered for the event!', 
      registration 
    });
  } catch (err) {
    console.error('Event registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};