/**
 * Autonomous Session API Handlers
 * Thin HTTP adapters that delegate to the integration layer
 */
import {
  listAutonomousSessions,
  getSessionDetails,
  getSessionLogs,
  createSessionMonitor,
  type MonitorEvent,
} from '../../src/integrations/channelcoder/index.js';
import { logger } from '../src/observability/logger.js';

// Active monitors for cleanup
const activeMonitors = new Map<string, () => void>();

/**
 * List all autonomous sessions
 */
export async function handleAutonomousList() {
  try {
    const sessions = await listAutonomousSessions();
    return {
      success: true,
      data: sessions
    };
  } catch (error) {
    logger.error('Failed to list autonomous sessions:', error);
    return {
      success: false,
      error: 'Failed to list sessions'
    };
  }
}

/**
 * Get session details including parsed log stats
 */
export async function handleAutonomousGet(taskId: string) {
  try {
    const session = await getSessionDetails(taskId);
    
    if (!session) {
      return {
        success: false,
        error: 'Session not found'
      };
    }
    
    return {
      success: true,
      data: session
    };
  } catch (error) {
    logger.error('Failed to get autonomous session:', error);
    return {
      success: false,
      error: 'Failed to get session details'
    };
  }
}

/**
 * Get combined log entries from all sessions
 */
export async function handleAutonomousLogs(limit = 50) {
  try {
    const logs = await getSessionLogs(limit);
    return {
      success: true,
      data: logs
    };
  } catch (error) {
    logger.error('Failed to get autonomous logs:', error);
    return {
      success: false,
      error: 'Failed to get logs'
    };
  }
}

/**
 * Subscribe to real-time updates for a session (WebSocket)
 */
export function createAutonomousMonitor(taskId: string, onEvent: (event: MonitorEvent) => void) {
  // Clean up existing monitor
  const existingCleanup = activeMonitors.get(taskId);
  if (existingCleanup) {
    existingCleanup();
  }
  
  // Create monitor using integration layer
  const cleanup = createSessionMonitor(taskId, onEvent);
  activeMonitors.set(taskId, cleanup);
  
  // Return cleanup function
  return () => {
    const cleanup = activeMonitors.get(taskId);
    if (cleanup) {
      cleanup();
      activeMonitors.delete(taskId);
    }
  };
}