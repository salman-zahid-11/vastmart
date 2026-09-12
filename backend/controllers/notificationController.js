const Notification = require('../models/Notification');
const User = require('../models/User');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { recipientId, title, message } = req.body;
    if (!recipientId || !title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Recipient, title, and message are required' });
    }

    const recipient = await User.findById(recipientId).select('_id');
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    const notification = await Notification.create({
      recipient: recipient._id,
      title: title.trim(),
      message: message.trim(),
      createdBy: req.user._id,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyNotifications, markNotificationRead, createNotification };
