/**
 * Shared log utilities for MCP handlers
 * Provides consistent log entry formatting
 */

/**
 * Append a timestamped log entry to existing log content
 */
export function appendTimestampedLogEntry(currentLog: string, entry: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const formattedEntry = `- ${timestamp}: ${entry}`;

  return currentLog ? `${currentLog}\n${formattedEntry}` : formattedEntry;
}

/**
 * Create a formatted log entry with timestamp
 */
export function createLogEntry(action: string, details?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = details ? `${action} - ${details}` : action;
  return `- ${timestamp}: ${entry}`;
}

/**
 * Parse log entries into structured format
 * Useful for analyzing or filtering logs
 */
export function parseLogEntries(log: string): Array<{
  date: string;
  entry: string;
}> {
  const lines = log.split('\n').filter((line) => line.trim());
  const entries: Array<{ date: string; entry: string }> = [];

  for (const line of lines) {
    const match = line.match(/^-\s*(\d{4}-\d{2}-\d{2}):\s*(.+)$/);
    if (match) {
      entries.push({
        date: match[1],
        entry: match[2].trim(),
      });
    }
  }

  return entries;
}
