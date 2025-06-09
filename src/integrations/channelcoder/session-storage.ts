/**
 * Custom session storage that extends ChannelCoder's session system
 * with our monitoring and task tracking requirements
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { SessionInfo, SessionState, SessionStorage } from 'channelcoder';
import { FileSessionStorage } from 'channelcoder';
import { SESSION_STORAGE } from './constants.js';

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
}

export class ScopecraftSessionStorage implements SessionStorage {
  private baseStorage: FileSessionStorage;
  private infoDir: string;
  private scopecraftMetadata?: ScopecraftSessionMetadata;

  constructor(baseDir?: string, projectRoot?: string) {
    const finalBaseDir = baseDir || SESSION_STORAGE.getBaseDir(projectRoot);
    this.baseStorage = new FileSessionStorage(SESSION_STORAGE.getSessionsDir(projectRoot));
    this.infoDir = finalBaseDir;
  }

  // Method to set metadata before saving
  setScopecraftMetadata(metadata: ScopecraftSessionMetadata) {
    this.scopecraftMetadata = metadata;
  }

  async save(state: SessionState, name?: string): Promise<string> {
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
    await fs.writeFile(
      infoPath,
      JSON.stringify(
        {
          sessionName,
          startTime: new Date().toISOString(),
          ...metadata,
        },
        null,
        2
      )
    );
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
