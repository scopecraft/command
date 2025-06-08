/**
 * ChannelCoder Integration Types
 * 
 * Abstraction layer over ChannelCoder SDK for future replaceability
 */

import type { WorkMode } from '../../core/environment/types.js';

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
  executeInteractive(options: InteractiveOptions): Promise<void>;
  
  /**
   * Execute Claude in Docker mode
   */
  executeDocker(options: DockerOptions): Promise<void>;
  
  /**
   * Check if ChannelCoder is available and configured
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Options for interactive Claude execution
 */
export interface InteractiveOptions {
  /**
   * The prompt to send to Claude
   */
  prompt: string;
  
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
  
  /**
   * Work mode (implement, explore, orchestrate, diagnose)
   */
  mode?: WorkMode;
  
  /**
   * Additional prompt context
   */
  additionalPrompt?: string;
  
  /**
   * Session configuration
   */
  session?: {
    /**
     * Session name for persistence
     */
    name?: string;
    
    /**
     * Continue from previous session
     */
    continue?: boolean;
  };
}

/**
 * Options for Docker-based Claude execution
 */
export interface DockerOptions extends InteractiveOptions {
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
}

/**
 * ChannelCoder session interface
 */
export interface ChannelCoderSession {
  /**
   * Session ID
   */
  id: string;
  
  /**
   * Start time
   */
  startTime: Date;
  
  /**
   * Task ID associated with session
   */
  taskId?: string;
  
  /**
   * Whether session is active
   */
  isActive: boolean;
}

/**
 * ChannelCoder error class
 */
export class ChannelCoderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
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

export type ChannelCoderErrorCode = typeof ChannelCoderErrorCodes[keyof typeof ChannelCoderErrorCodes];