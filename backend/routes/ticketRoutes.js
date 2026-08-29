const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  addTicketMessage,
  getAllTickets,
  updateTicket,
} = require('../controllers/ticketController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);
router.get('/', protect, authorizeRoles('admin'), getAllTickets);
router.get('/:id', protect, getTicketById);
router.post('/:id/messages', protect, addTicketMessage);
router.put('/:id', protect, authorizeRoles('admin'), updateTicket);

module.exports = router;