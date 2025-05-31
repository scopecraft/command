#!/usr/bin/env bun
import { logger } from './src/observability/logger.js';

// Test that the logger is working
logger.info('Test WebSocket logging', {
  test: true,
  timestamp: Date.now()
});

// Test with the same imports as claude-handler
import { logger as wsLogger } from './src/observability/logger.js';

wsLogger.info('Test from WebSocket import path', {
  test: true,
  path: 'websocket'
});

console.log('Tests complete. Check ~/.scopecraft/logs/');