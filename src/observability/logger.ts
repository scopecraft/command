import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Simple logger for server-side operations
 * Logs to both console and file
 */
class SimpleLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = '/Users/davidpaquet/.scopecraft/logs';
    this.logFile = join(this.logDir, `logs-${new Date().toISOString().split('T')[0]}.log`);
    mkdirSync(this.logDir, { recursive: true });
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
    };
    return JSON.stringify(logEntry);
  }

  private writeToFile(logLine: string): void {
    try {
      appendFileSync(this.logFile, `${logLine}\n`);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  info(message: string, data?: any): void {
    const logLine = this.formatMessage('INFO', message, data);
    console.log('[LOG]', logLine);
    this.writeToFile(logLine);
  }

  error(message: string, data?: any): void {
    const logLine = this.formatMessage('ERROR', message, data);
    console.error('[LOG]', logLine);
    this.writeToFile(logLine);
  }

  warn(message: string, data?: any): void {
    const logLine = this.formatMessage('WARN', message, data);
    console.warn('[LOG]', logLine);
    this.writeToFile(logLine);
  }

  debug(message: string, data?: any): void {
    const logLine = this.formatMessage('DEBUG', message, data);
    console.debug('[LOG]', logLine);
    this.writeToFile(logLine);
  }
}

export const logger = new SimpleLogger();