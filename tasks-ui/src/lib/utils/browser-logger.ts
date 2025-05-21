/**
 * Browser-compatible logger wrapper
 * Falls back to console logging if file system access fails
 */

// Import the main logger, but handle possible errors in browser environment
let logger: any;
try {
  const loggerModule = require('../../../observability/logger');
  logger = loggerModule.logger;
} catch (err) {
  // Create a fallback logger for browser environments
  logger = {
    info: (message: string, data?: any) => {
      console.log(`[INFO] ${message}`, data || '');
    },
    error: (message: string, data?: any) => {
      console.error(`[ERROR] ${message}`, data || '');
    },
    warn: (message: string, data?: any) => {
      console.warn(`[WARN] ${message}`, data || '');
    },
    debug: (message: string, data?: any) => {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  };
  
  console.warn('[LOGGER] Using browser fallback logger - file logging disabled');
}

export default logger;