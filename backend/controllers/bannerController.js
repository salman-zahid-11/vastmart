const Banner = require('../models/Banner');

// @desc   Get active banners (public)
// @route  GET /api/banners
const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all banners (admin)
// @route  GET /api/banners/admin/all
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Create a new banner
// @route  POST /api/banners
const createBanner = async (req, res) => {
  try {
    const { eyebrow, title, subtitle, ctaLabel, ctaLink, fullImage, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    const banner = await Banner.create({
      image: req.file.path,
      eyebrow,
      title,
      subtitle,
      ctaLabel,
      ctaLink,
      fullImage: fullImage === 'true',
      order: order || 0,
      createdBy: req.user._id,
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Toggle a banner active/inactive
// @route  PUT /api/banners/:id/toggle
const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Delete a banner
// @route  DELETE /api/banners/:id
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.deleteOne();
    res.status(200).json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getActiveBanners, getAllBanners, createBanner, toggleBanner, deleteBanner };