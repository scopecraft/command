/**
 * Autonomous Session API Handlers
 * Provides endpoints for monitoring autonomous task sessions
 */
import { monitorLog, parseLogFile, streamParser } from 'channelcoder';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import { logger } from '../src/observability/logger.js';

const AUTONOMOUS_BASE_DIR = '.tasks/.autonomous-sessions';
const LOG_DIR = path.join(AUTONOMOUS_BASE_DIR, 'logs');

interface SessionInfo {
  sessionName: string;
  taskId: string;
  parentId?: string;
  logFile: string;
  startTime: string;
  status: string;
  pid?: number;
}

interface SessionStats {
  messages: number;
  toolsUsed: string[];
  totalCost?: number;
  model?: string;
  lastOutput?: string;
  lastUpdate?: string;
}

// Active monitors
const activeMonitors = new Map<string, () => void>();

/**
 * List all autonomous sessions
 */
export async function handleAutonomousList() {
  try {
    const files = await fs.readdir(AUTONOMOUS_BASE_DIR);
    const infoFiles = files.filter(f => f.endsWith('.info.json'));
    
    const sessions = await Promise.all(
      infoFiles.map(async (file) => {
        const content = await fs.readFile(path.join(AUTONOMOUS_BASE_DIR, file), 'utf-8');
        return JSON.parse(content) as SessionInfo;
      })
    );
    
    return {
      success: true,
      data: sessions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
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
    // Find session info
    const files = await fs.readdir(AUTONOMOUS_BASE_DIR);
    const infoFile = files.find(f => f.includes(`task-${taskId}`) && f.endsWith('.info.json'));
    
    if (!infoFile) {
      return {
        success: false,
        error: 'Session not found'
      };
    }
    
    const info = JSON.parse(
      await fs.readFile(path.join(AUTONOMOUS_BASE_DIR, infoFile), 'utf-8')
    ) as SessionInfo;
    
    // Parse log file for stats
    const stats: SessionStats = {
      messages: 0,
      toolsUsed: [],
      lastUpdate: new Date().toISOString()
    };
    
    if (existsSync(info.logFile)) {
      const events = await parseLogFile(info.logFile);
      const toolSet = new Set<string>();
      
      for (const event of events) {
        if (streamParser.isAssistantEvent(event)) {
          stats.messages++;
          if (!stats.model) {
            stats.model = event.message.model;
          }
        }
        
        if (streamParser.isToolUseEvent(event)) {
          toolSet.add(event.tool);
        }
        
        if (streamParser.isResultEvent(event)) {
          stats.totalCost = event.total_cost;
        }
        
        const chunk = streamParser.eventToChunk(event);
        if (chunk?.content) {
          const content = chunk.content.trim();
          if (content.length > 10) {
            stats.lastOutput = content.substring(0, 100);
          }
        }
      }
      
      stats.toolsUsed = Array.from(toolSet);
    }
    
    return {
      success: true,
      data: {
        ...info,
        stats
      }
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
    const logEntries: any[] = [];
    
    // Get all log files
    const logFiles = await fs.readdir(LOG_DIR);
    
    // Parse each log file
    for (const logFile of logFiles.slice(-5)) { // Last 5 sessions
      const taskId = logFile.match(/task-([^-]+)/)?.[1] || 'unknown';
      const logPath = path.join(LOG_DIR, logFile);
      
      if (existsSync(logPath)) {
        const events = await parseLogFile(logPath);
        
        for (const event of events.slice(-10)) { // Last 10 events per file
          const chunk = streamParser.eventToChunk(event);
          if (chunk?.content) {
            logEntries.push({
              timestamp: new Date().toISOString(),
              taskId,
              content: chunk.content.trim().substring(0, 100),
              type: streamParser.isErrorEvent(event) ? 'error' : 'output'
            });
          }
        }
      }
    }
    
    // Sort by timestamp and limit
    return {
      success: true,
      data: logEntries
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
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
export function createAutonomousMonitor(taskId: string, onEvent: (event: any) => void) {
  // Clean up existing monitor
  const existingCleanup = activeMonitors.get(taskId);
  if (existingCleanup) {
    existingCleanup();
  }
  
  // Find log file
  fs.readdir(LOG_DIR).then(files => {
    const logFile = files.find(f => f.includes(`task-${taskId}`));
    if (!logFile) return;
    
    const logPath = path.join(LOG_DIR, logFile);
    
    // Start monitoring
    const cleanup = monitorLog(logPath, (event) => {
      const chunk = streamParser.eventToChunk(event);
      onEvent({
        type: 'autonomous-event',
        taskId,
        event,
        chunk
      });
    });
    
    activeMonitors.set(taskId, cleanup);
  });
  
  // Return cleanup function
  return () => {
    const cleanup = activeMonitors.get(taskId);
    if (cleanup) {
      cleanup();
      activeMonitors.delete(taskId);
    }
  };
}