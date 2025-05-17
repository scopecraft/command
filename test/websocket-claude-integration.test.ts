import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { spawn } from 'bun';

describe('Claude WebSocket Integration', () => {
  let serverProcess: any;

  beforeAll(async () => {
    // Check if claude CLI is available
    try {
      const checkClaude = spawn({
        cmd: ['which', 'claude'],
        stdout: 'pipe',
        stderr: 'pipe',
      });
      const code = await checkClaude.exited;
      if (code !== 0) {
        console.log('Claude CLI not found, skipping integration tests');
        return;
      }
    } catch (_e) {
      console.log('Cannot check for Claude CLI, skipping integration tests');
      return;
    }

    // Start the server
    serverProcess = spawn({
      cmd: ['bun', 'run', './tasks-ui/server.ts'],
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PORT: '3002' },
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should stream response from Claude CLI', (done) => {
    const ws = new WebSocket('ws://localhost:3002/ws/claude');
    const messages: string[] = [];

    ws.onopen = () => {
      // Wait for info message
    };

    ws.onmessage = (event) => {
      const data = event.data.toString();
      messages.push(data);

      try {
        const msg = JSON.parse(data);
        if (msg.info) {
          // Send a simple prompt after receiving info
          ws.send(
            JSON.stringify({
              prompt: 'Say "Hello World" and nothing else',
              meta: 'TEST-INTEGRATION',
            })
          );
        }
      } catch {
        // Non-JSON response from Claude
      }
    };

    ws.onclose = (_event) => {
      // Verify we received some messages
      expect(messages.length).toBeGreaterThan(1);

      // Should have received the info message
      const hasInfo = messages.some((m) => {
        try {
          const msg = JSON.parse(m);
          return msg.info !== undefined;
        } catch {
          return false;
        }
      });
      expect(hasInfo).toBe(true);

      done();
    };

    // Timeout after 30 seconds
    setTimeout(() => {
      ws.close();
      done();
    }, 30000);
  });
});
