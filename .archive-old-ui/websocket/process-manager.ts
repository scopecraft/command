import { logger } from '../src/observability/logger.js';

export class ProcessManager {
  private activeProcesses = new Set<any>();
  private server: any = null;

  setServer(server: any): void {
    this.server = server;
  }

  addProcess(proc: any): void {
    this.activeProcesses.add(proc);
    logger.info('Process added to manager', {
      pid: proc.pid,
      activeCount: this.activeProcesses.size
    });
  }

  removeProcess(proc: any): void {
    this.activeProcesses.delete(proc);
    logger.info('Process removed from manager', {
      pid: proc.pid,
      activeCount: this.activeProcesses.size
    });
  }

  killProcess(proc: any): void {
    try {
      proc.kill();
      this.removeProcess(proc);
      logger.info('Killed Claude process', {
        pid: proc.pid
      });
    } catch (error) {
      logger.error('Error killing process', {
        pid: proc.pid,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async shutdown(): Promise<void> {
    logger.info('Process manager shutting down', {
      activeProcesses: this.activeProcesses.size
    });
    
    // Kill all active Claude processes
    for (const proc of this.activeProcesses) {
      this.killProcess(proc);
    }
    
    // Stop the server if it exists
    if (this.server) {
      logger.info('Stopping server');
      try {
        this.server.stop();
      } catch (error) {
        logger.error('Error stopping server', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Exit the process
    process.exit(0);
  }

  setupShutdownHandlers(): void {
    // Handle Ctrl+C
    process.on('SIGINT', async () => {
      await this.shutdown();
    });
    
    // Handle termination signal
    process.on('SIGTERM', async () => {
      await this.shutdown();
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await this.shutdown();
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      await this.shutdown();
    });
  }
}