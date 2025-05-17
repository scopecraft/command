#!/usr/bin/env bun
import { logger } from './src/observability/logger.js';

// Test logging
logger.info('Test log message', {
  testType: 'manual',
  timestamp: Date.now()
});

logger.error('Test error message', {
  error: 'This is a test error',
  level: 'error'
});

console.log('Logging test complete. Check console output and ./logs/ directory.');