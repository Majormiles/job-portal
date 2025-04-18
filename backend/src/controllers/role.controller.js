import Role from '../models/role.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
export const getRoles = asyncHandler(async (req, res, next) => {
  const roles = await Role.find({ isActive: true }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: roles.length,
    data: roles
  });
});

// @desc    Get single role
// @route   GET /api/roles/:id
// @access  Private/Admin
export const getRole = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id);

  if (!role) {
    return next(new AppError('Role not found', 404));
  }

  res.status(200).json({
    success: true,
    data: role
  });
});

// @desc    Create role
// @route   POST /api/roles
// @access  Private/Admin
export const createRole = asyncHandler(async (req, res, next) => {
  const {
    name,
    displayName,
    description,
    permissions,
    registrationFields,
    isActive,
    isDefault
  } = req.body;

  // Check if role with the same name already exists
  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    return next(new AppError('Role with this name already exists', 400));
  }

  const role = await Role.create({
    name,
    displayName,
    description,
    permissions,
    registrationFields,
    isActive,
    isDefault
  });

  res.status(201).json({
    success: true,
    data: role
  });
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
export const updateRole = asyncHandler(async (req, res, next) => {
  const {
    name,
    displayName,
    description,
    permissions,
    registrationFields,
    isActive,
    isDefault
  } = req.body;

  // If updating name, check if the new name already exists for another role
  if (name) {
    const existingRole = await Role.findOne({
      name,
      _id: { $ne: req.params.id }
    });

    if (existingRole) {
      return next(new AppError('Role with this name already exists', 400));
    }
  }

  const role = await Role.findByIdAndUpdate(
    req.params.id,
    {
      name,
      displayName,
      description,
      permissions,
      registrationFields,
      isActive,
      isDefault
    },
    { new: true, runValidators: true }
  );

  if (!role) {
    return next(new AppError('Role not found', 404));
  }

  res.status(200).json({
    success: true,
    data: role
  });
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
export const deleteRole = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id);

  if (!role) {
    return next(new AppError('Role not found', 404));
  }

  // Prevent deletion of system roles
  if (['admin', 'jobSeeker', 'employer', 'trainer', 'trainee'].includes(role.name)) {
    return next(new AppError('Cannot delete system roles', 400));
  }

  await role.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Initialize default roles
// @route   POST /api/roles/initialize
// @access  Private/Admin
export const initializeRoles = asyncHandler(async (req, res, next) => {
  // Import the initializeRoles function from the Role model
  const { initializeRoles } = await import('../models/role.model.js');
  
  // Run the initialization
  await initializeRoles();
  
  // Get all roles to return in the response
  const roles = await Role.find();
  
  res.status(200).json({
    success: true,
    message: 'Default roles initialized successfully',
    count: roles.length,
    data: roles
  });
}); 