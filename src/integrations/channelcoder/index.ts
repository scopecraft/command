/**
 * ChannelCoder Integration Module
 *
 * Simple function-based wrapper around ChannelCoder SDK
 */

export {
  execute,
  createSession,
  loadSession,
  executeTmux,
  type ExecutionResult,
} from './client.js';

export {
  resolveModePromptPath,
  buildTaskData,
} from './utils.js';

export {
  ScopecraftSessionStorage,
  type ScopecraftSessionMetadata,
} from './session-storage.js';
