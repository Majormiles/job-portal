const Company = require('../models/company.model');
const User = require('../models/user.model');

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private (Employers only)
exports.createCompany = async (req, res) => {
  try {
    // Check if user already owns a company
    const existingCompany = await Company.findOne({ owner: req.user.id });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'You already own a company'
      });
    }

    const company = await Company.create({
      ...req.body,
      owner: req.user.id,
      employees: [req.user.id]
    });

    // Update user's company reference
    await User.findByIdAndUpdate(req.user.id, {
      company: company._id
    });

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating company',
      error: error.message
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res) => {
  try {
    const { industry, size, location } = req.query;
    const query = { status: 'active' };

    if (industry) query.industry = industry;
    if (size) query.size = size;
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    const companies = await Company.find(query)
      .populate('owner', 'name email')
      .select('-employees -jobs');

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Public
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('employees', 'name email profilePicture')
      .populate('jobs', 'title location type');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching company',
      error: error.message
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Company owner only)
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is the company owner
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: updatedCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating company',
      error: error.message
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Company owner only)
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is the company owner
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this company'
      });
    }

    // Remove company reference from owner
    await User.findByIdAndUpdate(company.owner, {
      $unset: { company: 1 }
    });

    await company.remove();

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    });
  }
};

// @desc    Add employee to company
// @route   POST /api/companies/:id/employees
// @access  Private (Company owner only)
exports.addEmployee = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is the company owner
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add employees'
      });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already an employee
    if (company.employees.includes(req.body.userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already an employee'
      });
    }

    company.employees.push(req.body.userId);
    await company.save();

    // Update user's company reference
    await User.findByIdAndUpdate(req.body.userId, {
      company: company._id
    });

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding employee',
      error: error.message
    });
  }
};

// @desc    Remove employee from company
// @route   DELETE /api/companies/:id/employees/:userId
// @access  Private (Company owner only)
exports.removeEmployee = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is the company owner
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove employees'
      });
    }

    // Check if user is an employee
    if (!company.employees.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not an employee'
      });
    }

    company.employees = company.employees.filter(
      emp => emp.toString() !== req.params.userId
    );
    await company.save();

    // Remove company reference from user
    await User.findByIdAndUpdate(req.params.userId, {
      $unset: { company: 1 }
    });

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing employee',
      error: error.message
    });
  }
}; 