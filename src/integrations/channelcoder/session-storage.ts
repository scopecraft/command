/**
 * Custom session storage that extends ChannelCoder's session system
 * with our monitoring and task tracking requirements
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { SessionInfo, SessionState, SessionStorage } from 'channelcoder';
import { FileSessionStorage } from 'channelcoder';
import type { IConfigurationManager } from '../../core/config/types.js';
import { SESSION_STORAGE, getCentralizedSessionPaths } from './constants.js';

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

  constructor(config?: IConfigurationManager, _baseDir?: string, _projectRoot?: string) {
    // Get centralized session paths - all worktrees share the same storage
    const paths = getCentralizedSessionPaths(config);

    // Use centralized paths, ignoring legacy parameters
    this.baseStorage = new FileSessionStorage(paths.sessionsDir);
    this.infoDir = paths.baseDir;

    // Ensure directories exist
    this.ensureDirectories().catch(console.error);
  }

  private async ensureDirectories(): Promise<void> {
    const paths = getCentralizedSessionPaths();
    await fs.mkdir(paths.sessionsDir, { recursive: true });
    await fs.mkdir(paths.logsDir, { recursive: true });
  }

  // Method to set metadata before saving
  setScopecraftMetadata(metadata: ScopecraftSessionMetadata) {
    this.scopecraftMetadata = metadata;
  }

  /**
   * Validates session data and checks for required metadata
   */
  private validateSessionData(state: SessionState): void {
    if (!state) {
      throw new Error('Session state is required');
    }
  }

  /**
   * Processes log file to extract real session ID and update metadata
   */
  private async prepareSessionMetadata(state: SessionState): Promise<void> {
    if (!this.scopecraftMetadata?.logFile) {
      return;
    }

    try {
      const { existsSync } = await import('node:fs');

      if (!existsSync(this.scopecraftMetadata.logFile)) {
        return;
      }

      await this.extractSessionIdFromLog(state);
    } catch (error) {
      console.warn('Error checking log file existence:', error);
    }
  }

  /**
   * Extracts session ID from log file and updates state
   */
  private async extractSessionIdFromLog(state: SessionState): Promise<void> {
    if (!this.scopecraftMetadata?.logFile) {
      return;
    }

    try {
      const { parseLogFile } = await import('channelcoder');
      const parsed = await parseLogFile(this.scopecraftMetadata.logFile);

      if (parsed.sessionId && parsed.sessionId !== this.scopecraftMetadata.realSessionId) {
        this.updateSessionWithParsedId(state, parsed.sessionId);
      }
    } catch (_error) {
      // Log parsing failed - might be incomplete file
      // This is OK, we'll try again on next save
    }
  }

  /**
   * Updates session state and metadata with parsed session ID
   */
  private updateSessionWithParsedId(state: SessionState, sessionId: string): void {
    if (!this.scopecraftMetadata) {
      return;
    }

    const previousSessionId = this.scopecraftMetadata.realSessionId;

    // Update the state with real session ID
    state.currentSessionId = sessionId;
    state.sessionChain = state.sessionChain
      .map((id) => (id?.startsWith('detached-') ? sessionId : id))
      .filter((id): id is string => id !== undefined);

    // Update our metadata
    this.scopecraftMetadata.realSessionId = sessionId;

    // Initialize or update session history
    if (!this.scopecraftMetadata.sessionHistory) {
      this.scopecraftMetadata.sessionHistory = [];
    }

    // Add new session to history
    this.scopecraftMetadata.sessionHistory.push({
      sessionId,
      startTime: new Date().toISOString(),
      resumedFrom: previousSessionId,
    });
  }

  /**
   * Writes session files including metadata for autonomous tasks
   */
  private async writeSessionFiles(state: SessionState, sessionName: string): Promise<void> {
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
  }

  async save(state: SessionState, name?: string): Promise<string> {
    // Step 1: Validate session data
    this.validateSessionData(state);

    // Step 2: Prepare metadata and process log file
    await this.prepareSessionMetadata(state);

    // Step 3: Save to ChannelCoder's session system
    const sessionName = await this.baseStorage.save(state, name);

    // Step 4: Write session files and metadata
    await this.writeSessionFiles(state, sessionName);

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
