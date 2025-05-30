import { logger } from './src/observability/logger.js';

export function streamClaude(fullPrompt: string) {
  // Add the --verbose flag which is required when using --output-format stream-json
  const cmd = ["claude", "-p", fullPrompt, "--output-format", "stream-json", "--verbose"];
  
  // Log to our file logger instead of console
  logger.info('[streamClaude] Full prompt being sent', {
    fullPrompt,
    promptLength: fullPrompt.length
  });
  
  logger.info('[streamClaude] Command array', {
    cmd: JSON.stringify(cmd)
  });
  
  // Create the process
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
  });
  
  // Log the process info
  logger.info('[streamClaude] Process spawned', {
    pid: proc.pid,
    exitCode: proc.exitCode
  });
  
  return proc;
}