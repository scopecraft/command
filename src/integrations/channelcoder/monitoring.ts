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
import { ConfigurationManager } from '../../core/config/configuration-manager.js';
import { getCentralizedSessionPaths, SESSION_STORAGE } from './constants.js';
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
export async function listAutonomousSessions(projectRoot?: string): Promise<SessionWithStats[]> {
  // Get centralized session paths
  const paths = getCentralizedSessionPaths(ConfigurationManager.getInstance());
  const baseDir = paths.baseDir;

  try {
    // Read info files directly from the sessions directory
    const files = await fs.readdir(baseDir).catch(() => []);
    const infoFiles = files.filter((f) => f.endsWith(SESSION_STORAGE.INFO_FILE_SUFFIX));

    const results = await Promise.all(
      infoFiles.map(async (file) => {
        try {
          const content = await fs.readFile(path.join(baseDir, file), 'utf-8');
          const sessionData = JSON.parse(content) as ScopecraftSessionMetadata & {
            sessionName: string;
            startTime: string;
          };

          // Determine current status
          let currentStatus = sessionData.status;
          if (sessionData.logFile && currentStatus === 'running') {
            currentStatus = await determineSessionStatus(sessionData.logFile);
          }

          // Get basic stats
          let stats: SessionStats | undefined;
          if (sessionData.logFile) {
            stats = await parseSessionStats(sessionData.logFile);
          }

          return {
            ...sessionData,
            status: currentStatus,
            stats,
          } as SessionWithStats;
        } catch (err) {
          console.warn(`Error reading info file ${file}:`, err);
          return null;
        }
      })
    );

    return results
      .filter((result): result is SessionWithStats => result !== null)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  } catch (err) {
    console.warn('Error listing autonomous sessions:', err);
    return [];
  }
}

/**
 * Get detailed session information including recent log lines
 */
export async function getSessionDetails(
  taskId: string,
  projectRoot?: string
): Promise<SessionDetails | null> {
  // Get centralized session paths
  const paths = getCentralizedSessionPaths(ConfigurationManager.getInstance());
  const baseDir = paths.baseDir;

  try {
    // Find the most recent info file for this task
    const files = await fs.readdir(baseDir).catch(() => []);
    const taskInfoFiles = files.filter(
      (f) => f.includes(`task-${taskId}`) && f.endsWith(SESSION_STORAGE.INFO_FILE_SUFFIX)
    );

    if (taskInfoFiles.length === 0) return null;

    // Sort by timestamp in filename (newest first)
    taskInfoFiles.sort((a, b) => b.localeCompare(a));

    const content = await fs.readFile(path.join(baseDir, taskInfoFiles[0]), 'utf-8');
    const sessionData = JSON.parse(content) as ScopecraftSessionMetadata & {
      sessionName: string;
      startTime: string;
    };

    // Get stats and recent log lines
    let stats: SessionStats = {
      messages: 0,
      toolsUsed: [],
      lastUpdate: new Date().toISOString(),
    };

    let lastLogLines: string[] = [];

    if (sessionData.logFile) {
      stats = await parseSessionStats(sessionData.logFile);
      lastLogLines = await getRecentLogLines(sessionData.logFile, 3);
    }

    return {
      ...sessionData,
      stats,
      lastLogLines,
    };
  } catch (err) {
    console.warn(`Error loading session details for task ${taskId}:`, err);
    return null;
  }
}

interface LogFileInfo {
  file: string;
  mtime: number;
  taskId: string;
  logPath: string;
}

/**
 * Find and sort session log files by modification time
 */
async function findSessionLogFiles(logDir: string): Promise<LogFileInfo[]> {
  try {
    const logFiles = await fs.readdir(logDir).catch(() => []);

    const fileInfos = await Promise.all(
      logFiles.map(async (file) => {
        const filePath = path.join(logDir, file);
        const stats = await fs.stat(filePath);
        const taskId = file.match(/task-([^-]+)/)?.[1] || 'unknown';

        return {
          file,
          mtime: stats.mtime.getTime(),
          taskId,
          logPath: filePath,
        };
      })
    );

    // Sort by modification time (newest first) and take up to 10 most recent
    return fileInfos.sort((a, b) => b.mtime - a.mtime).slice(0, 10);
  } catch (err) {
    console.warn('Error reading log directory:', err);
    return [];
  }
}

/**
 * Parse a single event into a log entry
 */
function parseLogEventEntry(event: ClaudeEvent, taskId: string): LogEntry[] {
  const entries: LogEntry[] = [];
  const timestamp = new Date().toISOString();

  // Parse content from chunk
  const chunk = streamParser.eventToChunk(event);
  if (chunk?.content) {
    const content = chunk.content.trim();
    if (content.length > 5) {
      entries.push({
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
    entries.push({
      timestamp,
      taskId,
      content: `🔧 Using tool: ${toolEvent.tool}`,
      type: 'tool',
    });
  }

  return entries;
}

/**
 * Aggregate log entries from multiple log files
 */
async function aggregateLogStreams(logFiles: LogFileInfo[]): Promise<LogEntry[]> {
  const logEntries: LogEntry[] = [];

  for (const { logPath, taskId } of logFiles) {
    if (existsSync(logPath)) {
      try {
        const parsed = await parseLogFile(logPath);
        const events = parsed.events || [];

        // Get recent events from each file (last 20)
        for (const event of events.slice(-20)) {
          const eventEntries = parseLogEventEntry(event, taskId);
          logEntries.push(...eventEntries);
        }
      } catch (err) {
        console.warn(`Error parsing log ${logPath}:`, err);
      }
    }
  }

  return logEntries;
}

/**
 * Format and limit the final log entries
 */
function formatSessionLogs(entries: LogEntry[], limit: number): LogEntry[] {
  return entries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get recent log entries from all sessions
 */
export async function getSessionLogs(limit = 50, projectRoot?: string): Promise<LogEntry[]> {
  // Get centralized session paths
  const paths = getCentralizedSessionPaths(ConfigurationManager.getInstance());
  const logDir = paths.logsDir;

  // Step 1: Find and sort log files
  const logFiles = await findSessionLogFiles(logDir);

  // Step 2: Aggregate entries from all log files
  const logEntries = await aggregateLogStreams(logFiles);

  // Step 3: Format and limit results
  return formatSessionLogs(logEntries, limit);
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
  onEvent: (event: MonitorEvent) => void,
  projectRoot?: string
): () => void {
  // Get centralized session paths
  const paths = getCentralizedSessionPaths(ConfigurationManager.getInstance());
  const LOG_DIR = paths.logsDir;

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
    .catch((_err) => {
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
  logFile: string,
  projectRoot?: string
): Promise<'running' | 'completed' | 'failed'> {
  try {
    const PROJECT_ROOT = projectRoot || getSessionStorageRoot(ConfigurationManager.getInstance());
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
async function parseSessionStats(logFile: string, projectRoot?: string): Promise<SessionStats> {
  const stats: SessionStats = {
    messages: 0,
    toolsUsed: [],
  };

  try {
    const PROJECT_ROOT = projectRoot || getSessionStorageRoot(ConfigurationManager.getInstance());
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
async function getRecentLogLines(
  logFile: string,
  count: number,
  projectRoot?: string
): Promise<string[]> {
  try {
    const PROJECT_ROOT = projectRoot || getSessionStorageRoot(ConfigurationManager.getInstance());
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
