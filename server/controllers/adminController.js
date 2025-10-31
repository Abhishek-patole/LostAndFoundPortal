const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { name, date, location, details, category } = req.body;

    if (!name || !date || !location || !details || !category) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const event = new Event({ name, date, location, details, category });
    await event.save();

    return res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, location, details, category, isActive } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      { name, date, location, details, category, isActive },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json({ message: 'Event updated successfully', event });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await EventRegistration.deleteMany({ eventId: id });

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participants = await EventRegistration.find({ eventId: id }).sort({ registrationDate: -1 });

    return res.status(200).json({ 
      event: event.name, 
      participants,
      count: participants.length 
    });
  } catch (err) {
    console.error('Get participants error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find()
      .populate('eventId', 'name date location')
      .sort({ registrationDate: -1 });

    return res.status(200).json({ registrations, count: registrations.length });
  } catch (err) {
    console.error('Get registrations error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};