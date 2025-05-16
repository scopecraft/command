export function streamClaude(fullPrompt: string) {
  return Bun.spawn({
    cmd: ["claude", "code", "-p", fullPrompt, "--output-format", "stream-json"],
    stdout: "pipe",
    stderr: "pipe",
  });
}