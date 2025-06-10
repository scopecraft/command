/**
 * Custom session storage that extends ChannelCoder's session system
 * with our monitoring and task tracking requirements
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { SessionInfo, SessionState, SessionStorage } from 'channelcoder';
import { FileSessionStorage } from 'channelcoder';
import type { IConfigurationManager } from '../../core/config/types.js';
import { SESSION_STORAGE, getSessionStorageRoot } from './constants.js';

export interface SessionHistoryEntry {
  sessionId: string;
  startTime: string;
  resumedFrom?: string; // Previous session ID if this is a resume
}

export interface ScopecraftSessionMetadata {
  taskId?: string;
  parentId?: string;
  logFile?: string;
  status: 'running' | 'completed' | 'failed';
  pid?: number;
  type: string; // 'autonomous-task', 'interactive', 'planning', etc.
  executionMode?: string; // 'detached', 'tmux', 'interactive', etc.
  dockerEnabled?: boolean; // True if running in docker
  executionFlags?: Record<string, unknown>; // Future extensibility
  realSessionId?: string; // The actual Claude session ID from the log file
  sessionHistory?: SessionHistoryEntry[]; // Track all session IDs for this task
}

export class ScopecraftSessionStorage implements SessionStorage {
  private baseStorage: FileSessionStorage;
  private infoDir: string;
  private scopecraftMetadata?: ScopecraftSessionMetadata;

  constructor(config?: IConfigurationManager, baseDir?: string, projectRoot?: string) {
    // Use ConfigurationManager if provided, otherwise fall back to legacy behavior
    const resolvedProjectRoot = config ? getSessionStorageRoot(config) : projectRoot;
    const finalBaseDir = baseDir || SESSION_STORAGE.getBaseDir(resolvedProjectRoot);
    this.baseStorage = new FileSessionStorage(SESSION_STORAGE.getSessionsDir(resolvedProjectRoot));
    this.infoDir = finalBaseDir;
  }

  // Method to set metadata before saving
  setScopecraftMetadata(metadata: ScopecraftSessionMetadata) {
    this.scopecraftMetadata = metadata;
  }

  async save(state: SessionState, name?: string): Promise<string> {
    // Always check for real session ID from log file when:
    // 1. We have a log file path configured
    // 2. The log file exists
    // This handles both initial detection and resume scenarios
    if (this.scopecraftMetadata?.logFile) {
      try {
        const { existsSync } = await import('node:fs');

        if (existsSync(this.scopecraftMetadata.logFile)) {
          try {
            const { parseLogFile } = await import('channelcoder');
            const parsed = await parseLogFile(this.scopecraftMetadata.logFile);

            if (parsed.sessionId && parsed.sessionId !== this.scopecraftMetadata.realSessionId) {
              // Found a new session ID (either initial or resumed)
              const previousSessionId = this.scopecraftMetadata.realSessionId;

              // Update the state with real session ID
              state.currentSessionId = parsed.sessionId;
              state.sessionChain = state.sessionChain
                .map((id) => (id?.startsWith('detached-') ? parsed.sessionId : id))
                .filter((id): id is string => id !== undefined);

              // Update our metadata
              if (this.scopecraftMetadata) {
                this.scopecraftMetadata.realSessionId = parsed.sessionId;

                // Initialize or update session history
                if (!this.scopecraftMetadata.sessionHistory) {
                  this.scopecraftMetadata.sessionHistory = [];
                }

                // Add new session to history
                this.scopecraftMetadata.sessionHistory.push({
                  sessionId: parsed.sessionId,
                  startTime: new Date().toISOString(),
                  resumedFrom: previousSessionId,
                });
              }
            }
          } catch (_error) {
            // Log parsing failed - might be incomplete file
            // This is OK, we'll try again on next save
          }
        }
        // If file doesn't exist yet, that's fine - we'll check on next save
      } catch (error) {
        // File system error - log it but don't fail the save
        console.warn('Error checking log file existence:', error);
      }
    }

    // Save to ChannelCoder's session system
    const sessionName = await this.baseStorage.save(state, name);

    // Save our additional metadata for monitoring
    // Only create info files for autonomous tasks (not interactive sessions)
    if (this.scopecraftMetadata && this.scopecraftMetadata.type === 'autonomous-task') {
      await this.saveSessionInfo(sessionName, this.scopecraftMetadata);
      // Update PID if available from state
      const stateWithPid = state as SessionState & { executionPid?: number };
      if (stateWithPid.executionPid) {
        this.scopecraftMetadata.pid = stateWithPid.executionPid;
        await this.saveSessionInfo(sessionName, this.scopecraftMetadata);
      }
    }

    return sessionName;
  }

  async load(nameOrPath: string): Promise<SessionState> {
    return await this.baseStorage.load(nameOrPath);
  }

  async list(): Promise<SessionInfo[]> {
    return await this.baseStorage.list();
  }

  // Our additional methods for monitoring
  async saveSessionInfo(sessionName: string, metadata: ScopecraftSessionMetadata): Promise<void> {
    await fs.mkdir(this.infoDir, { recursive: true });

    const infoPath = path.join(this.infoDir, `${sessionName}${SESSION_STORAGE.INFO_FILE_SUFFIX}`);

    // Load existing info to preserve session history
    let existingInfo: Record<string, unknown> = {};
    try {
      const content = await fs.readFile(infoPath, 'utf-8');
      existingInfo = JSON.parse(content);
    } catch {
      // File doesn't exist yet, that's fine
    }

    // Merge with new metadata, preserving session history
    const updatedInfo = {
      sessionName,
      startTime: existingInfo.startTime || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      ...metadata,
      // Preserve session history if it exists
      sessionHistory: metadata.sessionHistory || existingInfo.sessionHistory || [],
    };

    await fs.writeFile(infoPath, JSON.stringify(updatedInfo, null, 2));
  }

  async loadSessionInfo(taskId: string): Promise<ScopecraftSessionMetadata | null> {
    try {
      // Find most recent session for this task
      const files = await fs.readdir(this.infoDir).catch(() => []);
      const infoFiles = files.filter(
        (f) => f.includes(`task-${taskId}`) && f.endsWith(SESSION_STORAGE.INFO_FILE_SUFFIX)
      );

      if (infoFiles.length === 0) return null;

      // Sort by timestamp (newest first)
      infoFiles.sort((a, b) => b.localeCompare(a));

      const content = await fs.readFile(path.join(this.infoDir, infoFiles[0]), 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async listActiveSessions(): Promise<
    Array<SessionInfo & { scopecraftData?: ScopecraftSessionMetadata }>
  > {
    const sessions = await this.list();

    // Enhance with our metadata
    return Promise.all(
      sessions.map(async (session) => {
        const infoPath = path.join(this.infoDir, `${session.name}.info.json`);
        let scopecraftData: ScopecraftSessionMetadata | undefined;

        try {
          const content = await fs.readFile(infoPath, 'utf-8');
          scopecraftData = JSON.parse(content);
        } catch {
          // No scopecraft metadata
        }

        return { ...session, scopecraftData };
      })
    );
  }

  async updateRealSessionId(sessionName: string, realSessionId: string): Promise<void> {
    const infoPath = path.join(this.infoDir, `${sessionName}${SESSION_STORAGE.INFO_FILE_SUFFIX}`);

    try {
      // Read existing info
      const content = await fs.readFile(infoPath, 'utf-8');
      const info = JSON.parse(content);

      // Update with real session ID
      info.realSessionId = realSessionId;

      // Write back
      await fs.writeFile(infoPath, JSON.stringify(info, null, 2));
    } catch (error) {
      console.warn(`Failed to update real session ID for ${sessionName}:`, error);
    }
  }
}
