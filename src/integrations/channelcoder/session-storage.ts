/**
 * Custom session storage that extends ChannelCoder's session system
 * with our monitoring and task tracking requirements
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { SessionInfo, SessionState, SessionStorage } from 'channelcoder';
import { FileSessionStorage } from 'channelcoder';

export interface ScopecraftSessionMetadata {
  taskId?: string;
  parentId?: string;
  logFile?: string;
  status: 'running' | 'completed' | 'failed';
  pid?: number;
  type: 'autonomous-task' | 'interactive' | 'planning';
}

export class ScopecraftSessionStorage implements SessionStorage {
  private baseStorage: FileSessionStorage;
  private infoDir: string;

  constructor(baseDir = './.tasks/.autonomous-sessions') {
    this.baseStorage = new FileSessionStorage(path.join(baseDir, 'sessions'));
    this.infoDir = baseDir;
  }

  async save(state: SessionState, name?: string): Promise<string> {
    // Save to ChannelCoder's session system
    const sessionName = await this.baseStorage.save(state, name);

    // Save our additional metadata for monitoring
    if ((state.metadata as any).scopecraftData) {
      await this.saveSessionInfo(sessionName, (state.metadata as any).scopecraftData);
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

    const infoPath = path.join(this.infoDir, `${sessionName}.info.json`);
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
        (f) => f.includes(`task-${taskId}`) && f.endsWith('.info.json')
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
        let scopecraftData;

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
}
