/**
 * ChannelCoder Session Adapter
 *
 * Adapter implementation that wraps the ChannelCoder SDK.
 * This abstraction allows us to swap implementations in the future.
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { claude, session } from 'channelcoder';
import {
  type ChannelCoderClient,
  ChannelCoderError,
  ChannelCoderErrorCodes,
  type DetachedOptions,
  type DockerOptions,
  type InteractiveOptions,
  type SessionInfo,
  type SessionResult,
  type TmuxOptions,
  type WorkMode,
} from './types.js';
import {
  buildTaskContext,
  combinePrompts,
  generateSessionName,
  getSessionDirectories,
  loadModePrompt,
} from './utils.js';

/**
 * ChannelCoder client implementation
 *
 * Uses the ChannelCoder SDK to provide session management and execution
 * across multiple modes (interactive, docker, detached, tmux).
 */
export class ChannelCoderSessionAdapter implements ChannelCoderClient {
  /**
   * Execute claude and handle dry-run results
   */
  private async executeClaudeWithDryRun(
    prompt: string,
    options: any
  ): Promise<any> {
    const result = await claude(prompt, options);
    
    // If dry run, log the command that would be executed
    if (options.dryRun && result) {
      console.log('[DRY RUN] Command that would be executed:');
      console.log(JSON.stringify(result.data || result, null, 2));
    }
    
    return result;
  }

  /**
   * Execute session claude and handle dry-run results
   */
  private async executeSessionClaudeWithDryRun(
    session: any,
    prompt: string,
    options: any
  ): Promise<any> {
    const result = await session.claude(prompt, options);
    
    // If dry run, log the command that would be executed
    if (options.dryRun && result) {
      console.log('[DRY RUN] Command that would be executed:');
      console.log(JSON.stringify(result.data || result, null, 2));
    }
    
    return result;
  }
  /**
   * Execute Claude in interactive mode with worktree
   */
  async executeInteractive(options: InteractiveOptions): Promise<SessionResult> {
    try {
      // Setup session directories
      const { baseDir, logDir } = getSessionDirectories(options.projectRoot);
      await mkdir(logDir, { recursive: true });

      // Generate session name
      const sessionName =
        options.session?.name || generateSessionName(options.taskId, options.mode, 'interactive');

      // Build task context
      const taskContext = buildTaskContext(
        options.taskId,
        options.taskId, // We don't have title in options, using ID
        'task', // Generic type
        'in_progress'
      );

      // Load mode prompt
      const modePrompt = await loadModePrompt(options.projectRoot, options.mode);

      // Combine prompts
      const fullPrompt = combinePrompts(
        modePrompt,
        taskContext,
        options.taskInstruction,
        options.additionalPrompt,
        {
          mode: options.mode,
          taskId: options.taskId,
          additionalInstructions: options.additionalPrompt || '',
        }
      );

      // For interactive mode, we use the claude() function directly
      // with worktree support
      await this.executeClaudeWithDryRun(fullPrompt, {
        worktree: {
          branch: options.worktree.branch,
          path: options.worktree.path,
          create: options.worktree.create,
        },
        mode: 'interactive',
        verbose: true,
        dryRun: options.dryRun,
      });

      // Save session info
      const sessionInfo: SessionInfo = {
        sessionName,
        taskId: options.taskId,
        parentId: options.session?.parentId,
        startTime: new Date().toISOString(),
        status: 'completed',
        type: 'interactive',
        mode: options.mode,
        execType: 'interactive',
      };

      const infoPath = join(baseDir, `${sessionName}.info.json`);
      await writeFile(infoPath, JSON.stringify(sessionInfo, null, 2));

      return {
        success: true,
        sessionName,
        infoFile: infoPath,
      };
    } catch (error) {
      throw new ChannelCoderError(
        `Failed to execute interactive session: ${error instanceof Error ? error.message : String(error)}`,
        ChannelCoderErrorCodes.SESSION_FAILED,
        { options, originalError: error }
      );
    }
  }

  /**
   * Execute Claude in Docker mode
   */
  async executeDocker(options: DockerOptions): Promise<SessionResult> {
    try {
      // Setup session directories
      const { baseDir, logDir } = getSessionDirectories(options.projectRoot);
      await mkdir(logDir, { recursive: true });

      // Generate session name
      const sessionName =
        options.session?.name || generateSessionName(options.taskId, options.mode, 'docker');

      const logFile = join(logDir, `${sessionName}.log`);

      // Build task context
      const taskContext = buildTaskContext(options.taskId, options.taskId, 'task', 'in_progress');

      // Load mode prompt
      const modePrompt = await loadModePrompt(options.projectRoot, options.mode);

      // Combine prompts
      const fullPrompt = combinePrompts(
        modePrompt,
        taskContext,
        options.taskInstruction,
        options.additionalPrompt,
        {
          mode: options.mode,
          taskId: options.taskId,
          additionalInstructions: options.additionalPrompt || '',
        }
      );

      // Create session for Docker execution
      const s = session({
        name: sessionName,
        autoSave: true,
      });

      // Save session info before starting
      const sessionInfo: SessionInfo = {
        sessionName,
        taskId: options.taskId,
        parentId: options.session?.parentId,
        logFile,
        startTime: new Date().toISOString(),
        status: 'running',
        type: 'dispatch',
        mode: options.mode,
        execType: 'docker',
      };

      const infoPath = join(baseDir, `${sessionName}.info.json`);
      await writeFile(infoPath, JSON.stringify(sessionInfo, null, 2));

      // Execute via Docker using claude() with docker options
      await this.executeSessionClaudeWithDryRun(s, fullPrompt, {
        docker: {
          image: options.docker.image,
          mounts: options.docker.mounts,
          env: options.docker.env,
        },
        data: {
          taskId: options.taskId,
          parentId: options.session?.parentId,
          mode: options.mode,
          additionalInstructions: options.additionalPrompt || '',
        },
        outputFormat: 'json' as const,
        verbose: true,
        dryRun: options.dryRun,
      });

      // Update session info
      sessionInfo.status = 'completed';
      sessionInfo.pid = process.pid;
      await writeFile(infoPath, JSON.stringify(sessionInfo, null, 2));

      return {
        success: true,
        sessionName,
        pid: process.pid,
        logFile,
        infoFile: infoPath,
      };
    } catch (error) {
      throw new ChannelCoderError(
        `Failed to execute Docker session: ${error instanceof Error ? error.message : String(error)}`,
        ChannelCoderErrorCodes.DOCKER_FAILED,
        { options, originalError: error }
      );
    }
  }

  /**
   * Execute Claude in detached mode (background process)
   */
  async executeDetached(options: DetachedOptions): Promise<SessionResult> {
    try {
      // Setup session directories
      const { baseDir, logDir } = getSessionDirectories(options.projectRoot);
      await mkdir(logDir, { recursive: true });

      // Generate session name
      const sessionName =
        options.session?.name || generateSessionName(options.taskId, options.mode, 'detached');

      const logFile = join(logDir, `${sessionName}.log`);

      // Build prompts
      const taskContext = buildTaskContext(options.taskId, options.taskId, 'task', 'in_progress');

      const modePrompt = await loadModePrompt(options.projectRoot, options.mode);

      // For 'auto' mode, we use the autonomous router
      const promptFile =
        options.mode === 'auto' ? '.tasks/.modes/orchestration/autonomous.md' : null;

      // Create session
      const s = session({
        name: sessionName,
        autoSave: true,
      });

      // Save session info
      const sessionInfo: SessionInfo = {
        sessionName,
        taskId: options.taskId,
        parentId: options.session?.parentId,
        logFile,
        startTime: new Date().toISOString(),
        status: 'running',
        type: 'autonomous-task',
        mode: options.mode,
        execType: 'detached',
      };

      const infoPath = join(baseDir, `${sessionName}.info.json`);
      await writeFile(infoPath, JSON.stringify(sessionInfo, null, 2));

      // Execute detached - use the prompt file if available
      const promptToUse = promptFile ? join(options.projectRoot, promptFile) : null;

      if (!promptToUse && !modePrompt) {
        throw new Error('No mode prompt found');
      }

      // If we have content, write it to a temp file
      let tempPromptFile = promptToUse;
      if (!tempPromptFile && modePrompt) {
        tempPromptFile = join(logDir, `${sessionName}-prompt.md`);
        await writeFile(tempPromptFile, modePrompt);
      }

      // Execute in detached mode using claude() with detached option
      const fullPrompt = combinePrompts(
        modePrompt,
        taskContext,
        options.taskInstruction,
        options.additionalPrompt,
        {
          mode: options.mode,
          taskId: options.taskId,
          additionalInstructions: options.additionalPrompt || '',
        }
      );

      await this.executeSessionClaudeWithDryRun(s, fullPrompt, {
        detached: true,
        logFile,
        stream: true,
        data: {
          taskId: options.taskId,
          parentId: options.session?.parentId,
          mode: options.mode,
          additionalInstructions: options.additionalPrompt || '',
        },
        outputFormat: 'json' as const,
        dryRun: options.dryRun,
      });

      // For detached mode, we'll use the current process PID as a placeholder
      const pid = process.pid;
      sessionInfo.pid = pid;
      await writeFile(infoPath, JSON.stringify(sessionInfo, null, 2));

      return {
        success: true,
        sessionName,
        pid,
        logFile,
        infoFile: infoPath,
      };
    } catch (error) {
      throw new ChannelCoderError(
        `Failed to execute detached session: ${error instanceof Error ? error.message : String(error)}`,
        ChannelCoderErrorCodes.SESSION_FAILED,
        { options, originalError: error }
      );
    }
  }

  /**
   * Check if tmux is available on the system
   */
  private checkTmuxAvailable(): void {
    const tmuxCheck = spawnSync('which', ['tmux']);
    if (tmuxCheck.status !== 0) {
      throw new Error('tmux is not installed or not in PATH');
    }
  }

  /**
   * Ensure tmux session exists, create if needed
   */
  private ensureTmuxSession(sessionName: string): void {
    const sessionList = spawnSync('tmux', ['list-sessions', '-F', '#{session_name}']);
    const sessions = sessionList.stdout?.toString().split('\n').filter(Boolean) || [];

    if (!sessions.includes(sessionName)) {
      spawnSync('tmux', ['new-session', '-d', '-s', sessionName]);
    }
  }

  /**
   * Build channelcoder command for tmux execution
   */
  private buildChannelcoderCommand(modePromptPath: string, options: TmuxOptions): string {
    return [
      'channelcoder',
      modePromptPath,
      '-d',
      `mode="${options.mode}"`,
      '-d',
      `taskId="${options.taskId}"`,
      '-d',
      `additionalInstructions="${options.additionalPrompt || ''}"`,
      options.dryRun ? '--dry-run' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Execute Claude in tmux session
   */
  async executeTmux(options: TmuxOptions): Promise<SessionResult> {
    try {
      // Check if tmux is available
      this.checkTmuxAvailable();

      // Setup session directories
      const { baseDir, logDir } = getSessionDirectories(options.projectRoot);
      mkdirSync(logDir, { recursive: true });

      // Generate names
      const sessionName =
        options.session?.name || generateSessionName(options.taskId, options.mode, 'tmux');
      const tmuxSession = options.tmuxSession || 'scopecraft';
      const tmuxWindow = options.tmuxWindow || `${options.taskId}-${options.mode}`;
      const logFile = join(logDir, `${sessionName}.log`);

      // Load mode prompt and get path
      await loadModePrompt(options.projectRoot, options.mode);
      const modePromptPath = join(
        options.projectRoot,
        '.tasks',
        '.modes',
        options.mode === 'auto' ? 'orchestration' : options.mode,
        options.mode === 'auto' ? 'autonomous.md' : 'base.md'
      );

      // Ensure tmux session exists
      this.ensureTmuxSession(tmuxSession);

      // Build and execute command
      const channelcoderCmd = this.buildChannelcoderCommand(modePromptPath, options);

      if (!options.dryRun) {
        const tmuxResult = spawnSync('tmux', [
          'new-window',
          '-t',
          tmuxSession,
          '-n',
          tmuxWindow,
          '-c',
          options.worktree.path,
          channelcoderCmd,
        ]);

        if (tmuxResult.status !== 0) {
          throw new Error(`Failed to create tmux window: ${tmuxResult.stderr?.toString()}`);
        }

        // Disable automatic renaming
        spawnSync('tmux', [
          'set-window-option',
          '-t',
          `${tmuxSession}:${tmuxWindow}`,
          'automatic-rename',
          'off',
        ]);
        spawnSync('tmux', [
          'set-window-option',
          '-t',
          `${tmuxSession}:${tmuxWindow}`,
          'allow-rename',
          'off',
        ]);
      } else {
        console.log(
          `[DRY RUN] Would execute: tmux new-window -t ${tmuxSession} -n ${tmuxWindow} -c ${options.worktree.path} ${channelcoderCmd}`
        );
      }

      // Save session info
      const sessionInfo: SessionInfo = {
        sessionName,
        taskId: options.taskId,
        parentId: options.session?.parentId,
        logFile,
        startTime: new Date().toISOString(),
        status: 'running',
        type: 'dispatch',
        mode: options.mode,
        execType: 'tmux',
      };

      const infoPath = join(baseDir, `${sessionName}.info.json`);
      writeFileSync(infoPath, JSON.stringify(sessionInfo, null, 2));

      return {
        success: true,
        sessionName,
        logFile,
        infoFile: infoPath,
      };
    } catch (error) {
      throw new ChannelCoderError(
        `Failed to execute tmux session: ${error instanceof Error ? error.message : String(error)}`,
        ChannelCoderErrorCodes.SESSION_FAILED,
        { options, originalError: error }
      );
    }
  }

  /**
   * Continue an existing session
   */
  async continueSession(sessionId: string): Promise<SessionResult> {
    try {
      // We don't need to create a session object since we're loading directly
      // Load the saved session
      const loadedSession = await session.load(sessionId);

      // The loaded session can now be used to continue the conversation
      // For now, just return success as the actual continuation would depend
      // on what the caller wants to do with the session
      return {
        success: true,
        sessionName: sessionId,
        // Return the loaded session for the caller to use
        session: loadedSession,
      };
    } catch (error) {
      throw new ChannelCoderError(
        `Failed to continue session: ${error instanceof Error ? error.message : String(error)}`,
        ChannelCoderErrorCodes.SESSION_FAILED,
        { sessionId, originalError: error }
      );
    }
  }

  /**
   * Check if ChannelCoder is available and configured
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Check if channelcoder command is available
      const result = spawnSync('which', ['channelcoder']);
      return result.status === 0;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create ChannelCoder client
 */
export function createChannelCoderClient(): ChannelCoderClient {
  return new ChannelCoderSessionAdapter();
}
