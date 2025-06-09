/**
 * ChannelCoder Integration Module
 *
 * Provides an abstraction layer over the ChannelCoder SDK
 * for future replaceability and testing.
 */

// Export all types
export * from './types.js';

// Export session adapter
export {
  ChannelCoderSessionAdapter,
  createChannelCoderClient,
} from './session-adapter.js';

// Export utilities
export * from './utils.js';
