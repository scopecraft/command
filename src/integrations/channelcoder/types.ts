/**
 * ChannelCoder Integration Types
 *
 * Abstraction layer over ChannelCoder SDK for future replaceability
 */

/**
 * Work mode for Claude sessions
 * Determines which mode prompt to load and how Claude should approach the task
 */
export type WorkMode = 'implement' | 'explore' | 'orchestrate' | 'diagnose' | 'auto';

/**
 * ChannelCoder client interface
 * Wraps the ChannelCoder SDK to provide a stable interface
 */
export interface ChannelCoderClient {
  /**
   * Execute Claude in interactive mode with worktree
   * Note: We use ChannelCoder's worktree support for Claude execution,
   * but manage worktrees directly for env command operations
   */
  executeInteractive(options: InteractiveOptions): Promise<SessionResult>;

  /**
   * Execute Claude in Docker mode
   */
  executeDocker(options: DockerOptions): Promise<SessionResult>;

  /**
   * Execute Claude in detached mode (background process)
   */
  executeDetached(options: DetachedOptions): Promise<SessionResult>;

  /**
   * Execute Claude in tmux session
   */
  executeTmux(options: TmuxOptions): Promise<SessionResult>;

  /**
   * Continue an existing session
   */
  continueSession(sessionId: string): Promise<SessionResult>;

  /**
   * Check if ChannelCoder is available and configured
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Base options for all Claude execution modes
 */
interface BaseExecutionOptions {
  /**
   * Task ID being executed
   */
  taskId: string;

  /**
   * Task instruction/content
   */
  taskInstruction: string;

  /**
   * Work mode (implement, explore, orchestrate, diagnose, auto)
   */
  mode: WorkMode;

  /**
   * Additional prompt context from user
   */
  additionalPrompt?: string;

  /**
   * Project root directory
   */
  projectRoot: string;

  /**
   * Session configuration
   */
  session?: SessionConfig;

  /**
   * If true, show what would be executed without running it
   */
  dryRun?: boolean;
}

/**
 * Session configuration
 */
export interface SessionConfig {
  /**
   * Session name (auto-generated if not provided)
   */
  name?: string;

  /**
   * Continue from previous session
   */
  continue?: boolean;

  /**
   * Parent task ID (for subtasks)
   */
  parentId?: string;
}

/**
 * Options for interactive Claude execution
 */
export interface InteractiveOptions extends BaseExecutionOptions {
  /**
   * Worktree configuration
   */
  worktree: {
    /**
     * Branch name for the worktree
     */
    branch: string;

    /**
     * Path to the worktree (if already created)
     */
    path: string;

    /**
     * Whether to create the worktree if it doesn't exist
     */
    create: boolean;
  };
}

/**
 * Options for Docker-based Claude execution
 */
export interface DockerOptions extends BaseExecutionOptions {
  /**
   * Docker configuration
   */
  docker: {
    /**
     * Docker image to use
     */
    image: string;

    /**
     * Additional volume mounts
     */
    mounts?: string[];

    /**
     * Environment variables to pass to Docker
     */
    env?: Record<string, string>;

    /**
     * Additional docker run arguments
     */
    args?: string[];
  };

  /**
   * Worktree configuration
   */
  worktree: {
    /**
     * Branch name for the worktree
     */
    branch: string;

    /**
     * Path to the worktree
     */
    path: string;
  };
}

/**
 * Options for detached execution
 */
export interface DetachedOptions extends BaseExecutionOptions {
  /**
   * Worktree configuration
   */
  worktree: {
    /**
     * Branch name for the worktree
     */
    branch: string;

    /**
     * Path to the worktree
     */
    path: string;
  };
}

/**
 * Options for tmux execution
 */
export interface TmuxOptions extends BaseExecutionOptions {
  /**
   * Worktree configuration
   */
  worktree: {
    /**
     * Branch name for the worktree
     */
    branch: string;

    /**
     * Path to the worktree
     */
    path: string;
  };

  /**
   * Tmux session name (defaults to "scopecraft")
   */
  tmuxSession?: string;

  /**
   * Tmux window name (defaults to "{taskId}-{mode}")
   */
  tmuxWindow?: string;
}

/**
 * Result of session execution
 */
export interface SessionResult {
  /**
   * Whether execution was successful
   */
  success: boolean;

  /**
   * Session name/ID
   */
  sessionName: string;

  /**
   * Process ID (for detached/tmux modes)
   */
  pid?: number;

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Path to log file
   */
  logFile?: string;

  /**
   * Session info file path
   */
  infoFile?: string;

  /**
   * Session object (for continued sessions)
   */
  session?: unknown;
}

/**
 * Session info structure (saved to .info.json files)
 */
export interface SessionInfo {
  /**
   * Session name/ID
   */
  sessionName: string;

  /**
   * Task ID
   */
  taskId: string;

  /**
   * Parent task ID (for subtasks)
   */
  parentId?: string;

  /**
   * Path to log file
   */
  logFile?: string;

  /**
   * Session start time
   */
  startTime: string;

  /**
   * Session status
   */
  status: 'running' | 'completed' | 'failed' | 'interrupted';

  /**
   * Process ID
   */
  pid?: number;

  /**
   * Session type
   */
  type: 'autonomous-task' | 'interactive' | 'dispatch';

  /**
   * Work mode
   */
  mode: WorkMode;

  /**
   * Execution type
   */
  execType: 'docker' | 'detached' | 'tmux' | 'interactive';
}

/**
 * ChannelCoder error class
 */
export class ChannelCoderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ChannelCoderError';
  }
}

/**
 * Error codes for ChannelCoder operations
 */
export const ChannelCoderErrorCodes = {
  SDK_NOT_FOUND: 'SDK_NOT_FOUND',
  SDK_NOT_CONFIGURED: 'SDK_NOT_CONFIGURED',
  SESSION_FAILED: 'SESSION_FAILED',
  WORKTREE_FAILED: 'WORKTREE_FAILED',
  DOCKER_FAILED: 'DOCKER_FAILED',
  INVALID_OPTIONS: 'INVALID_OPTIONS',
} as const;

export type ChannelCoderErrorCode =
  (typeof ChannelCoderErrorCodes)[keyof typeof ChannelCoderErrorCodes];
