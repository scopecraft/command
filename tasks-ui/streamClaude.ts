export function streamClaude(fullPrompt: string) {
  const cmd = ["claude", "code", "-p", fullPrompt, "--output-format", "stream-json"];
  console.log('[streamClaude] Spawning command:', cmd.join(' '));
  
  return Bun.spawn({
    cmd: cmd,
    stdout: "pipe",
    stderr: "pipe",
  });
}