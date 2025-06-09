/**
 * Session monitoring and statistics integration
 * Provides core session monitoring functionality for autonomous tasks
 */

import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  type AssistantEvent,
  type ClaudeEvent,
  type ResultEvent,
  type StreamChunk,
  type ToolUseEvent,
  monitorLog,
  parseLogFile,
  streamParser,
} from 'channelcoder';
import { type ScopecraftSessionMetadata, ScopecraftSessionStorage } from './session-storage.js';

export interface SessionStats {
  messages: number;
  toolsUsed: string[];
  totalCost?: number;
  model?: string;
  lastOutput?: string;
  lastUpdate?: string;
}

export interface SessionWithStats extends ScopecraftSessionMetadata {
  sessionName: string;
  startTime: string;
  stats?: SessionStats;
}

export interface SessionDetails extends SessionWithStats {
  lastLogLines: string[];
}

export interface LogEntry {
  timestamp: string;
  taskId: string;
  content: string;
  type: 'output' | 'tool' | 'error';
}

/**
 * List all autonomous sessions with basic stats
 */
export async function listAutonomousSessions(): Promise<SessionWithStats[]> {
  const storage = new ScopecraftSessionStorage();
  const sessions = await storage.listActiveSessions();

  const results = await Promise.all(
    sessions.map(async (session) => {
      if (!session.scopecraftData) return null;

      // Determine current status
      let currentStatus = session.scopecraftData.status;
      if (session.scopecraftData.logFile && currentStatus === 'running') {
        currentStatus = await determineSessionStatus(session.scopecraftData.logFile);
      }

      // Get basic stats
      let stats: SessionStats | undefined;
      if (session.scopecraftData.logFile) {
        stats = await parseSessionStats(session.scopecraftData.logFile);
      }

      return {
        ...session.scopecraftData,
        sessionName: session.name,
        startTime: session.created.toISOString(),
        status: currentStatus,
        stats,
      } as SessionWithStats;
    })
  );

  return results
    .filter((result): result is SessionWithStats => result !== null)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

/**
 * Get detailed session information including recent log lines
 */
export async function getSessionDetails(taskId: string): Promise<SessionDetails | null> {
  const storage = new ScopecraftSessionStorage();
  const sessionInfo = await storage.loadSessionInfo(taskId);

  if (!sessionInfo) return null;

  // Find the session name from active sessions
  const sessions = await storage.listActiveSessions();
  const session = sessions.find((s) => s.scopecraftData?.taskId === taskId);

  if (!session) return null;

  // Get stats and recent log lines
  let stats: SessionStats = {
    messages: 0,
    toolsUsed: [],
    lastUpdate: new Date().toISOString(),
  };

  let lastLogLines: string[] = [];

  if (sessionInfo.logFile) {
    stats = await parseSessionStats(sessionInfo.logFile);
    lastLogLines = await getRecentLogLines(sessionInfo.logFile, 3);
  }

  return {
    ...sessionInfo,
    sessionName: session.name,
    startTime: session.created.toISOString(),
    stats,
    lastLogLines,
  };
}

/**
 * Get recent log entries from all sessions
 */
export async function getSessionLogs(limit = 50): Promise<LogEntry[]> {
  const PROJECT_ROOT = process.cwd();
  const LOG_DIR = path.join(PROJECT_ROOT, '.tasks/.autonomous-sessions/logs');

  const logEntries: LogEntry[] = [];

  try {
    const logFiles = await fs.readdir(LOG_DIR).catch(() => []);

    // Sort log files by modification time
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

          // Get events from each file
          for (const event of events.slice(-20)) {
            const chunk = streamParser.eventToChunk(event);
            if (chunk?.content) {
              const content = chunk.content.trim();
              if (content.length > 5) {
                const timestamp = new Date().toISOString();

                logEntries.push({
                  timestamp,
                  taskId,
                  content: content.substring(0, 200),
                  type: streamParser.isErrorEvent(event)
                    ? 'error'
                    : streamParser.isToolUseEvent(event)
                      ? 'tool'
                      : 'output',
                });
              }
            }

            // Add tool use events explicitly
            if (streamParser.isToolUseEvent(event)) {
              const toolEvent = event as ToolUseEvent;
              logEntries.push({
                timestamp: new Date().toISOString(),
                taskId,
                content: `🔧 Using tool: ${toolEvent.tool}`,
                type: 'tool',
              });
            }
          }
        } catch (err) {
          console.warn(`Error parsing log ${logFile}:`, err);
        }
      }
    }
  } catch (err) {
    console.warn('Error reading log directory:', err);
  }

  return logEntries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export interface MonitorEvent {
  type: 'autonomous-event' | 'error';
  taskId: string;
  message?: string;
  event?: {
    type: string;
    tool?: string;
    content?: string;
    error?: string;
  };
}

/**
 * Create real-time monitor for a session
 */
export function createSessionMonitor(
  taskId: string,
  onEvent: (event: MonitorEvent) => void
): () => void {
  const PROJECT_ROOT = process.cwd();
  const LOG_DIR = path.join(PROJECT_ROOT, '.tasks/.autonomous-sessions/logs');

  let cleanup: (() => void) | null = null;

  // Find log file asynchronously
  fs.readdir(LOG_DIR)
    .then((files) => {
      const logFile = files.find((f) => f.includes(`task-${taskId}`));
      if (!logFile) {
        onEvent({
          type: 'error',
          taskId,
          message: 'Log file not found',
        });
        return;
      }

      const logPath = path.join(LOG_DIR, logFile);

      // Start monitoring
      cleanup = monitorLog(logPath, (event: ClaudeEvent) => {
        try {
          const chunk = streamParser.eventToChunk(event);
          onEvent({
            type: 'autonomous-event',
            taskId,
            event: {
              type: event.type,
              tool: streamParser.isToolUseEvent(event) ? (event as ToolUseEvent).tool : undefined,
              content: chunk?.content,
              error: streamParser.isErrorEvent(event)
                ? (event as ClaudeEvent & { error: string }).error
                : undefined,
            },
          });
        } catch (err) {
          console.error('Error processing event:', err);
        }
      });
    })
    .catch((err) => {
      onEvent({
        type: 'error',
        taskId,
        message: 'Failed to start monitoring',
      });
    });

  // Return cleanup function
  return () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  };
}

/**
 * Determine session status based on log file activity
 */
async function determineSessionStatus(
  logFile: string
): Promise<'running' | 'completed' | 'failed'> {
  try {
    const PROJECT_ROOT = process.cwd();
    const logPath = path.isAbsolute(logFile) ? logFile : path.join(PROJECT_ROOT, logFile);

    if (!existsSync(logPath)) return 'failed';

    const stats = await fs.stat(logPath);
    const minutesAgo = (Date.now() - stats.mtime.getTime()) / 1000 / 60;

    // If no activity for 2 minutes, consider completed
    return minutesAgo > 2 ? 'completed' : 'running';
  } catch {
    return 'failed';
  }
}

/**
 * Parse session statistics from log file
 */
async function parseSessionStats(logFile: string): Promise<SessionStats> {
  const stats: SessionStats = {
    messages: 0,
    toolsUsed: [],
  };

  try {
    const PROJECT_ROOT = process.cwd();
    const logPath = path.isAbsolute(logFile) ? logFile : path.join(PROJECT_ROOT, logFile);

    if (!existsSync(logPath)) return stats;

    const parsed = await parseLogFile(logPath);
    const events = parsed.events || [];
    const toolSet = new Set<string>();
    let lastMessageTime: Date | null = null;

    for (const event of events) {
      if (streamParser.isAssistantEvent(event)) {
        const assistantEvent = event as AssistantEvent;
        stats.messages++;
        lastMessageTime = new Date();
        if (!stats.model) {
          stats.model = assistantEvent.message.model;
        }
      }

      if (streamParser.isToolUseEvent(event)) {
        const toolEvent = event as ToolUseEvent;
        toolSet.add(toolEvent.tool);
      }

      if (streamParser.isResultEvent(event)) {
        const resultEvent = event as ResultEvent;
        stats.totalCost = resultEvent.total_cost;
      }

      const chunk = streamParser.eventToChunk(event);
      if (chunk?.content) {
        const content = chunk.content.trim();
        if (content.length > 10) {
          stats.lastOutput = content.substring(0, 200);
        }
      }
    }

    stats.toolsUsed = Array.from(toolSet);
    if (lastMessageTime) {
      stats.lastUpdate = lastMessageTime.toISOString();
    }
  } catch (err) {
    console.warn('Error parsing session stats:', err);
  }

  return stats;
}

/**
 * Get recent log lines from a log file
 */
async function getRecentLogLines(logFile: string, count: number): Promise<string[]> {
  try {
    const PROJECT_ROOT = process.cwd();
    const logPath = path.isAbsolute(logFile) ? logFile : path.join(PROJECT_ROOT, logFile);

    if (!existsSync(logPath)) return [];

    const parsed = await parseLogFile(logPath);
    const events = parsed.events || [];
    const lines: string[] = [];

    for (const event of events) {
      const chunk = streamParser.eventToChunk(event);
      if (chunk?.content) {
        const content = chunk.content.trim();
        if (content.length > 10) {
          lines.push(content);
        }
      }
    }

    return lines.slice(-count);
  } catch {
    return [];
  }
}
