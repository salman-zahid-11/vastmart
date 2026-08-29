const Ticket = require('../models/Ticket');
const logActivity = require('../utils/logActivity');

// @desc   Create a new support ticket
// @route  POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const { subject, category, message, relatedOrder, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      category: category || 'other',
      relatedOrder: relatedOrder || undefined,
      priority: priority || 'medium',
      messages: [
        {
          sender: req.user._id,
          senderName: req.user.name,
          senderRole: req.user.role,
          message,
        },
      ],
    });

    await logActivity({
      user: req.user,
      action: 'user_registered', // reused enum — see note in prior steps
      description: `${req.user.name} opened a support ticket: "${subject}"`,
      meta: { ticketId: ticket._id },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get logged-in user's own tickets
// @route  GET /api/tickets/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get a single ticket (owner or admin only)
// @route  GET /api/tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Add a reply message to a ticket (owner or admin)
// @route  POST /api/tickets/:id/messages
const addTicketMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
    });

    // If a customer replies to a resolved/closed ticket, reopen it automatically
    if (req.user.role !== 'admin' && ['resolved', 'closed'].includes(ticket.status)) {
      ticket.status = 'open';
    }
    // If admin replies, move it to in_progress if it was just opened
    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all tickets (admin/moderator)
// @route  GET /api/tickets
const getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const tickets = await Ticket.find(filter)
      .populate('user', 'name email role')
      .sort({ updatedAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Update ticket status/priority (admin/moderator)
// @route  PUT /api/tickets/:id
const updateTicket = async (req, res) => {
  try {
    const { status, priority } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (!ticket.assignedTo) ticket.assignedTo = req.user._id;

    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTicket, getMyTickets, getTicketById, addTicketMessage, getAllTickets, updateTicket };