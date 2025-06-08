/**
 * ChannelCoder Session Adapter
 * 
 * Adapter implementation that wraps the ChannelCoder SDK.
 * This abstraction allows us to swap implementations in the future.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { 
  ChannelCoderError,
  ChannelCoderErrorCodes,
  type ChannelCoderClient,
  type DockerOptions,
  type InteractiveOptions 
} from './types.js';

/**
 * ChannelCoder client implementation
 * 
 * Note: This is a placeholder implementation since we don't have the actual
 * ChannelCoder SDK yet. The real implementation would import and use the SDK.
 */
export class ChannelCoderSessionAdapter implements ChannelCoderClient {
  /**
   * Execute Claude in interactive mode with worktree
   */
  async executeInteractive(options: InteractiveOptions): Promise<void> {
    // Validate options
    this.validateInteractiveOptions(options);
    
    try {
      // TODO: Replace with actual ChannelCoder SDK calls
      // For now, we'll implement a basic version using the channelcoder CLI
      
      const args: string[] = ['claude'];
      
      // Add worktree configuration
      if (options.worktree.path && existsSync(options.worktree.path)) {
        args.push('--worktree', options.worktree.path);
      } else if (options.worktree.create) {
        args.push('--worktree', options.worktree.branch);
      }
      
      // Add mode if specified
      if (options.mode) {
        args.push('--mode', options.mode);
      }
      
      // Add session options
      if (options.session?.name) {
        args.push('--session', options.session.name);
      }
      if (options.session?.continue) {
        args.push('--continue');
      }
      
      // Add prompt
      args.push('--prompt', options.prompt);
      
      // Additional prompt context
      if (options.additionalPrompt) {
        args.push('--additional', options.additionalPrompt);
      }
      
      // Execute channelcoder command
      await this.executeCommand('channelcoder', args);
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
  async executeDocker(options: DockerOptions): Promise<void> {
    // Validate options
    this.validateDockerOptions(options);
    
    try {
      // TODO: Replace with actual ChannelCoder SDK calls
      const args: string[] = ['claude', '--docker'];
      
      // Add Docker image
      args.push('--image', options.docker.image);
      
      // Add worktree configuration
      if (options.worktree.path && existsSync(options.worktree.path)) {
        args.push('--worktree', options.worktree.path);
      } else if (options.worktree.create) {
        args.push('--worktree', options.worktree.branch);
      }
      
      // Add mode if specified
      if (options.mode) {
        args.push('--mode', options.mode);
      }
      
      // Add Docker mounts
      if (options.docker.mounts) {
        for (const mount of options.docker.mounts) {
          args.push('--mount', mount);
        }
      }
      
      // Add Docker environment variables
      if (options.docker.env) {
        for (const [key, value] of Object.entries(options.docker.env)) {
          args.push('--env', `${key}=${value}`);
        }
      }
      
      // Add additional Docker args
      if (options.docker.args) {
        args.push('--docker-args', options.docker.args.join(' '));
      }
      
      // Add prompt
      args.push('--prompt', options.prompt);
      
      // Execute channelcoder command
      await this.executeCommand('channelcoder', args);
    } catch (error) {
      throw new ChannelCoderError(
        `Failed to execute Docker session: ${error instanceof Error ? error.message : String(error)}`,
        ChannelCoderErrorCodes.DOCKER_FAILED,
        { options, originalError: error }
      );
    }
  }
  
  /**
   * Check if ChannelCoder is available and configured
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Check if channelcoder command is available
      await this.executeCommand('channelcoder', ['--version'], { silent: true });
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Validate interactive options
   */
  private validateInteractiveOptions(options: InteractiveOptions): void {
    if (!options.prompt) {
      throw new ChannelCoderError(
        'Prompt is required for interactive execution',
        ChannelCoderErrorCodes.INVALID_OPTIONS,
        { options }
      );
    }
    
    if (!options.worktree || !options.worktree.branch) {
      throw new ChannelCoderError(
        'Worktree branch is required',
        ChannelCoderErrorCodes.INVALID_OPTIONS,
        { options }
      );
    }
  }
  
  /**
   * Validate Docker options
   */
  private validateDockerOptions(options: DockerOptions): void {
    // First validate base interactive options
    this.validateInteractiveOptions(options);
    
    if (!options.docker || !options.docker.image) {
      throw new ChannelCoderError(
        'Docker image is required for Docker execution',
        ChannelCoderErrorCodes.INVALID_OPTIONS,
        { options }
      );
    }
  }
  
  /**
   * Execute a command and return a promise
   */
  private executeCommand(
    command: string, 
    args: string[], 
    options?: { silent?: boolean }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: options?.silent ? 'ignore' : 'inherit',
        shell: false,
      });
      
      child.on('error', (error) => {
        reject(new Error(`Failed to execute ${command}: ${error.message}`));
      });
      
      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${command} exited with code ${code}`));
        }
      });
    });
  }
}

/**
 * Factory function to create ChannelCoder client
 */
export function createChannelCoderClient(): ChannelCoderClient {
  return new ChannelCoderSessionAdapter();
}