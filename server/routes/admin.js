const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  getAllRegistrations
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Event CRUD
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Participants
router.get('/events/:id/participants', getEventParticipants);
router.get('/registrations', getAllRegistrations);

module.exports = router;