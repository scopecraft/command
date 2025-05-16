import { logger } from './src/observability/logger.js';

export function streamClaude(fullPrompt: string) {
  const cmd = ["claude", "-p", fullPrompt, "--output-format", "stream-json"];
  
  // Log to our file logger instead of console
  logger.info('[streamClaude] Full prompt being sent', {
    fullPrompt,
    promptLength: fullPrompt.length
  });
  
  logger.info('[streamClaude] Command array', {
    cmd: JSON.stringify(cmd)
  });
  
  // Let's test alternative spawn syntax
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