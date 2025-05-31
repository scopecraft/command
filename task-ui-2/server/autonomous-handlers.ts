/**
 * Autonomous Session API Handlers
 * Provides endpoints for monitoring autonomous task sessions
 */
import { monitorLog, parseLogFile, streamParser } from 'channelcoder';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import { logger } from '../src/observability/logger.js';

// Handle both running from task-ui-2 and from project root
const PROJECT_ROOT = process.cwd().endsWith('task-ui-2') 
  ? path.resolve(process.cwd(), '..') 
  : process.cwd();
const AUTONOMOUS_BASE_DIR = path.join(PROJECT_ROOT, '.tasks/.autonomous-sessions');
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
    const files = await fs.readdir(AUTONOMOUS_BASE_DIR).catch(() => []);
    const infoFiles = files.filter(f => f.endsWith('.info.json'));
    
    const sessions = await Promise.all(
      infoFiles.map(async (file) => {
        try {
          const content = await fs.readFile(path.join(AUTONOMOUS_BASE_DIR, file), 'utf-8');
          const info = JSON.parse(content) as SessionInfo;
          
          // Simple status check - if no activity for 2 minutes, mark as completed
          let currentStatus = info.status;
          // Handle both absolute and relative paths
          const logPath = path.isAbsolute(info.logFile) ? info.logFile : path.join(PROJECT_ROOT, info.logFile);
          if (currentStatus === 'running' && existsSync(logPath)) {
            const stats = await fs.stat(logPath);
            const minutesAgo = (Date.now() - stats.mtime.getTime()) / 1000 / 60;
            if (minutesAgo > 2) {
              currentStatus = 'completed';
            }
          }
          
          
          // Get basic stats from log file
          let stats = null;
          const logFilePath = path.isAbsolute(info.logFile) ? info.logFile : path.join(PROJECT_ROOT, info.logFile);
          if (existsSync(logFilePath)) {
            try {
              const parsed = await parseLogFile(logFilePath);
              const events = parsed.events || [];
              const toolSet = new Set<string>();
              let messages = 0;
              let totalCost = undefined;
              let lastOutput = '';
              
              for (const event of events) {
                if (streamParser.isAssistantEvent(event)) {
                  messages++;
                }
                if (streamParser.isToolUseEvent(event)) {
                  toolSet.add(event.tool);
                }
                if (streamParser.isResultEvent(event)) {
                  totalCost = event.total_cost;
                }
                const chunk = streamParser.eventToChunk(event);
                if (chunk?.content && chunk.content.trim().length > 10) {
                  lastOutput = chunk.content.trim().substring(0, 100);
                }
              }
              
              stats = {
                messages,
                toolsUsed: Array.from(toolSet),
                totalCost,
                lastOutput
              };
            } catch (err) {
              logger.warn('Error parsing log file:', { 
                error: err instanceof Error ? err.message : String(err), 
                logFile: logFilePath 
              });
            }
          }
          
          return {
            ...info,
            status: currentStatus,
            stats
          };
        } catch {
          return null;
        }
      })
    );
    
    return {
      success: true,
      data: sessions
        .filter(Boolean)
        .sort((a, b) => 
          new Date(b!.startTime).getTime() - new Date(a!.startTime).getTime()
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
    const files = await fs.readdir(AUTONOMOUS_BASE_DIR).catch(() => []);
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
    
    // Handle both absolute and relative paths
    const logPath = path.isAbsolute(info.logFile) ? info.logFile : path.join(PROJECT_ROOT, info.logFile);
    
    // Get last 3 lines of log file
    let lastLogLines: string[] = [];
    
    if (existsSync(logPath)) {
      try {
        const parsed = await parseLogFile(logPath);
        const events = parsed.events || [];
        const toolSet = new Set<string>();
        let lastMessageTime = null;
        const logLines: string[] = [];
        
        for (const event of events) {
          if (streamParser.isAssistantEvent(event)) {
            stats.messages++;
            lastMessageTime = new Date();
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
              stats.lastOutput = content.substring(0, 200);
              // Collect log lines for last 3 display
              logLines.push(content);
            }
          }
        }
        
        // Get last 3 log lines
        lastLogLines = logLines.slice(-3);
        
        stats.toolsUsed = Array.from(toolSet);
        if (lastMessageTime) {
          stats.lastUpdate = lastMessageTime.toISOString();
        }
      } catch (err) {
        logger.warn('Error parsing log file:', { 
          error: err instanceof Error ? err.message : String(err), 
          logFile: logPath 
        });
      }
    }
    
    return {
      success: true,
      data: {
        ...info,
        stats,
        lastLogLines
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
    const logFiles = await fs.readdir(LOG_DIR).catch(() => {
      logger.warn(`Log directory not found: ${LOG_DIR}`);
      return [];
    });
    
    // Sort log files by modification time (newest first)
    const sortedFiles = await Promise.all(
      logFiles.map(async (file) => {
        const filePath = path.join(LOG_DIR, file);
        const stats = await fs.stat(filePath);
        return { file, mtime: stats.mtime.getTime() };
      })
    );
    sortedFiles.sort((a, b) => b.mtime - a.mtime);
    
    // Parse recent log files (up to 10 most recent)
    for (const { file: logFile } of sortedFiles.slice(0, 10)) {
      const taskId = logFile.match(/task-([^-]+)/)?.[1] || 'unknown';
      const logPath = path.join(LOG_DIR, logFile);
      
      if (existsSync(logPath)) {
        try {
          const parsed = await parseLogFile(logPath);
        const events = parsed.events || [];
          
          // Get more events from each file (last 20 instead of 10)
          for (const event of events.slice(-20)) {
            const chunk = streamParser.eventToChunk(event);
            if (chunk?.content) {
              const content = chunk.content.trim();
              if (content.length > 5) {
                // Use event timestamp if available, otherwise use current time
                const timestamp = event.timestamp || new Date().toISOString();
                
                logEntries.push({
                  timestamp,
                  taskId,
                  content: content.substring(0, 200),
                  type: streamParser.isErrorEvent(event) ? 'error' : 
                        streamParser.isToolUseEvent(event) ? 'tool' : 'output'
                });
              }
            }
            
            // Also add tool use events explicitly
            if (streamParser.isToolUseEvent(event)) {
              logEntries.push({
                timestamp: event.timestamp || new Date().toISOString(),
                taskId,
                content: `🔧 Using tool: ${event.tool}`,
                type: 'tool'
              });
            }
          }
        } catch (err) {
          logger.warn(`Error parsing log ${logFile}:`, err);
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
    if (!logFile) {
      onEvent({
        type: 'error',
        taskId,
        message: 'Log file not found'
      });
      return;
    }
    
    const logPath = path.join(LOG_DIR, logFile);
    
    // Start monitoring
    const cleanup = monitorLog(logPath, (event) => {
      try {
        const chunk = streamParser.eventToChunk(event);
        onEvent({
          type: 'autonomous-event',
          taskId,
          event: {
            type: event.type,
            tool: streamParser.isToolUseEvent(event) ? event.tool : undefined,
            content: chunk?.content,
            error: streamParser.isErrorEvent(event) ? event.error : undefined
          }
        });
      } catch (err) {
        logger.error('Error processing event:', err);
      }
    }, {
      onError: (error) => {
        onEvent({
          type: 'error',
          taskId,
          message: error.message
        });
      }
    });
    
    activeMonitors.set(taskId, cleanup);
  }).catch(err => {
    onEvent({
      type: 'error',
      taskId,
      message: 'Failed to start monitoring'
    });
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