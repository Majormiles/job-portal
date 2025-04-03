import debug from 'debug';

// Create namespaced debuggers
const debugOnboarding = debug('app:onboarding');
const debugValidation = debug('app:validation');
const debugDB = debug('app:database');

// Helper to stringify objects with circular references
const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, 2);
};

// Debug helpers for onboarding flow
const debugHelpers = {
  logSectionUpdate: (userId, section, data) => {
    debugOnboarding(`Updating section for user ${userId}:`);
    debugOnboarding(`Section: ${section}`);
    debugOnboarding(`Data: ${safeStringify(data)}`);
  },

  logValidation: (section, data, issues) => {
    debugValidation(`Validating ${section}:`);
    debugValidation(`Input: ${safeStringify(data)}`);
    if (issues && issues.length > 0) {
      debugValidation(`Validation issues: ${safeStringify(issues)}`);
    } else {
      debugValidation('Validation passed');
    }
  },

  logDBOperation: (operation, collection, query, result) => {
    debugDB(`${operation} on ${collection}:`);
    debugDB(`Query: ${safeStringify(query)}`);
    debugDB(`Result: ${safeStringify(result)}`);
  },

  logRequest: (req) => {
    debugOnboarding('Incoming request:');
    debugOnboarding(`Method: ${req.method}`);
    debugOnboarding(`Path: ${req.path}`);
    debugOnboarding(`Params: ${safeStringify(req.params)}`);
    debugOnboarding(`Query: ${safeStringify(req.query)}`);
    debugOnboarding(`Body: ${safeStringify(req.body)}`);
    if (req.file) {
      debugOnboarding(`File: ${safeStringify(req.file)}`);
    }
  },

  logResponse: (statusCode, data) => {
    debugOnboarding(`Response (${statusCode}):`);
    debugOnboarding(safeStringify(data));
  },

  logError: (error, context = {}) => {
    debugOnboarding('Error occurred:');
    debugOnboarding(`Message: ${error.message}`);
    debugOnboarding(`Stack: ${error.stack}`);
    debugOnboarding(`Context: ${safeStringify(context)}`);
  }
};

export default debugHelpers; 