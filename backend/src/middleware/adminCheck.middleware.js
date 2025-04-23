import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware to add the isAdmin property to the user object
 * This helps with backward compatibility for routes that check req.user.isAdmin
 */
export const addAdminFlag = asyncHandler(async (req, res, next) => {
  // Check if there's a user object
  if (req.user) {
    // Check if the user has admin role or if admin type is specified in headers
    const isAdmin = req.user.roleName === 'admin' || 
                    req.headers['x-admin-type'] === 'admin' || 
                    req.headers['x-admin-type'] === 'super-admin';
    
    // Add the isAdmin property to the user object
    req.user.isAdmin = isAdmin;
    
    console.log(`Admin flag middleware: Setting isAdmin=${isAdmin} for user ${req.user._id}`);
  }
  
  next();
});

export default addAdminFlag; 