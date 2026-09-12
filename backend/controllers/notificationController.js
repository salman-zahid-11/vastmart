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
    const { recipientIds = [], audience = 'selected', title, message } = req.body;
    if (!Array.isArray(recipientIds) || recipientIds.length === 0 || !title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Select at least one recipient, title, and message are required' });
    }

    const audienceFilter = {
      all: {},
      customers: { role: 'customer' },
      sellers: { role: 'seller' },
      moderators: { role: 'admin', adminLevel: 'moderator' },
      admins: { role: 'admin' },
      selected: { _id: { $in: recipientIds } },
    }[audience];
    if (!audienceFilter) return res.status(400).json({ message: 'Invalid notification audience' });

    const recipients = await User.find(audienceFilter).select('_id');
    if (recipients.length === 0) return res.status(404).json({ message: 'No matching recipients found' });

    const notifications = await Notification.insertMany(recipients.map((recipient) => ({
      recipient: recipient._id,
      title: title.trim(),
      message: message.trim(),
      createdBy: req.user._id,
    })));
    res.status(201).json({ count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyNotifications, markNotificationRead, createNotification };
