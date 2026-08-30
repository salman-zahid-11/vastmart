const SellerApplication = require('../models/SellerApplication');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');

// @desc   Submit a new seller application
// @route  POST /api/seller-applications
const submitApplication = async (req, res) => {
  try {
    const { businessName, businessType, businessAddress, nidNumber, tradeLicenseNumber, additionalNotes } = req.body;

    if (!businessName || !businessAddress || !nidNumber) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (!req.files?.nidDocument) {
      return res.status(400).json({ message: 'NID document is required' });
    }

    // Prevent duplicate pending applications
    const existing = await SellerApplication.findOne({ user: req.user._id });
    if (existing && existing.status === 'pending') {
      return res.status(400).json({ message: 'You already have a pending application' });
    }
    if (existing && existing.status === 'approved') {
      return res.status(400).json({ message: 'You are already an approved seller' });
    }

    const applicationData = {
      user: req.user._id,
      businessName,
      businessType,
      businessAddress,
      nidNumber,
      nidDocument: req.files.nidDocument[0].path,
      tradeLicenseNumber,
      additionalNotes,
      status: 'pending',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
    };

        if (req.files?.tradeLicenseDocument) {
      applicationData.tradeLicenseDocument = req.files.tradeLicenseDocument[0].path;
    }

    let application;
    if (existing) {
      // Resubmission after rejection — overwrite the old record
      application = await SellerApplication.findByIdAndUpdate(existing._id, applicationData, { new: true });
    } else {
      application = await SellerApplication.create(applicationData);
    }

    await logActivity({
      user: req.user,
      action: 'user_registered', // reuse existing enum value; see note below
      description: `${req.user.name} submitted a seller application`,
      meta: { applicationId: application._id },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get logged-in user's own application status
// @route  GET /api/seller-applications/my-application
const getMyApplication = async (req, res) => {
  try {
    const application = await SellerApplication.findOne({ user: req.user._id });
    res.status(200).json(application || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all applications (admin)
// @route  GET /api/seller-applications
const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const applications = await SellerApplication.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Approve or reject an application
// @route  PUT /api/seller-applications/:id/review
const reviewApplication = async (req, res) => {
  try {
    const { decision, rejectionReason } = req.body; // decision: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    const application = await SellerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = decision;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    if (decision === 'rejected') {
      application.rejectionReason = rejectionReason || 'Not specified';
    }
    await application.save();

    // If approved, promote the user to seller role
    if (decision === 'approved') {
      await User.findByIdAndUpdate(application.user, { role: 'seller' });
    }

    await logActivity({
      user: req.user,
      action: decision === 'approved' ? 'product_approved' : 'product_rejected', // reused enum, see note
      description: `Admin ${decision} seller application from user ${application.user}`,
      meta: { applicationId: application._id },
    });

    res.status(200).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Approve or reject multiple seller applications at once
// @route  PUT /api/seller-applications/bulk-review
const bulkReviewApplications = async (req, res) => {
  try {
    const { applicationIds, decision } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: 'applicationIds must be a non-empty array' });
    }
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    const applications = await SellerApplication.find({ _id: { $in: applicationIds }, status: 'pending' });

    for (const app of applications) {
      app.status = decision;
      app.reviewedBy = req.user._id;
      app.reviewedAt = new Date();
      if (decision === 'rejected') {
        app.rejectionReason = 'Bulk rejected';
      }
      await app.save();

      if (decision === 'approved') {
        await User.findByIdAndUpdate(app.user, { role: 'seller' });
      }
    }

    await logActivity({
      user: req.user,
      action: decision === 'approved' ? 'product_approved' : 'product_rejected',
      description: `${req.user.name} bulk ${decision} ${applications.length} seller application(s)`,
      meta: { applicationIds },
    });

    res.status(200).json({ message: `${applications.length} application(s) ${decision}`, count: applications.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitApplication, getMyApplication, getAllApplications, reviewApplication, bulkReviewApplications };