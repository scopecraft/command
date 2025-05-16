export class ProcessManager {
  private activeProcesses = new Set<any>();
  private server: any = null;

  setServer(server: any): void {
    this.server = server;
  }

  addProcess(proc: any): void {
    this.activeProcesses.add(proc);
  }

  removeProcess(proc: any): void {
    this.activeProcesses.delete(proc);
  }

  killProcess(proc: any): void {
    try {
      proc.kill();
      this.removeProcess(proc);
      console.log('Killed Claude process');
    } catch (error) {
      console.error('Error killing process:', error);
    }
  }

  async shutdown(): Promise<void> {
    console.log('\nShutting down...');
    
    // Kill all active Claude processes
    for (const proc of this.activeProcesses) {
      this.killProcess(proc);
    }
    
    // Stop the server if it exists
    if (this.server) {
      console.log('Stopping server...');
      try {
        this.server.stop();
      } catch (error) {
        console.error('Error stopping server:', error);
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