/**
 * Async handler to avoid try-catch blocks in controllers
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - Express middleware function with error handling
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler; 