const PromotionalPopup = require('../models/PromotionalPopup');

const getActivePopup = async (req, res) => {
  try {
    const popup = await PromotionalPopup.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(popup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllPopups = async (req, res) => {
  try {
    const popups = await PromotionalPopup.find({}).sort({ createdAt: -1 });
    res.status(200).json(popups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createPopup = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Popup image is required' });
    const popup = await PromotionalPopup.create({
      image: req.file.path,
      title: req.body.title,
      link: req.body.link,
      duration: req.body.duration || 5,
      createdBy: req.user._id,
    });
    res.status(201).json(popup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updatePopup = async (req, res) => {
  try {
    const popup = await PromotionalPopup.findById(req.params.id);
    if (!popup) return res.status(404).json({ message: 'Popup not found' });
    if (req.file) popup.image = req.file.path;
    if (req.body.title !== undefined) popup.title = req.body.title;
    if (req.body.link !== undefined) popup.link = req.body.link;
    if (req.body.duration !== undefined) popup.duration = req.body.duration;
    await popup.save();
    res.status(200).json(popup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const togglePopup = async (req, res) => {
  try {
    const popup = await PromotionalPopup.findById(req.params.id);
    if (!popup) return res.status(404).json({ message: 'Popup not found' });
    popup.isActive = !popup.isActive;
    await popup.save();
    res.status(200).json(popup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePopup = async (req, res) => {
  try {
    const popup = await PromotionalPopup.findByIdAndDelete(req.params.id);
    if (!popup) return res.status(404).json({ message: 'Popup not found' });
    res.status(200).json({ message: 'Popup deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getActivePopup, getAllPopups, createPopup, updatePopup, togglePopup, deletePopup };
