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
  type ScopecraftClaudeOptions,
} from './client.js';

export {
  resolveModePromptPath,
  buildTaskData,
} from './utils.js';

export {
  executeAutonomousTask,
  executeInteractiveTask,
  executePlan,
} from './helpers.js';

export {
  ScopecraftSessionStorage,
  type ScopecraftSessionMetadata,
} from './session-storage.js';

export {
  listAutonomousSessions,
  getSessionDetails,
  getSessionLogs,
  createSessionMonitor,
  type SessionStats,
  type SessionWithStats,
  type SessionDetails,
  type LogEntry,
  type MonitorEvent,
} from './monitoring.js';
