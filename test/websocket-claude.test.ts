import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { spawn } from 'bun';
import WebSocket from 'ws';
import { ClaudeWebSocketMessageSchema } from '../tasks-ui/websocket/schemas';

describe('Claude WebSocket Endpoint', () => {
  let serverProcess: any;

  beforeAll(async () => {
    // Start the server in a subprocess
    serverProcess = spawn({
      cmd: ['bun', 'run', './tasks-ui/server.ts'],
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PORT: '3001' },
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should reject connection with invalid JSON', (done) => {
    const ws = new WebSocket('ws://localhost:3001/ws/claude');

    ws.on('open', () => {
      ws.send('invalid json');
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.error).toBe('Bad JSON');
    });

    ws.on('close', (code) => {
      expect(code).toBe(1008);
      done();
    });
  });

  it('should reject connection with missing prompt', (done) => {
    const ws = new WebSocket('ws://localhost:3001/ws/claude');

    ws.on('open', () => {
      ws.send(JSON.stringify({ meta: 'TASK-123' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.error).toBe('Invalid prompt');
    });

    ws.on('close', (code) => {
      expect(code).toBe(1008);
      done();
    });
  });

  it('should reject connection with invalid meta', (done) => {
    const ws = new WebSocket('ws://localhost:3001/ws/claude');

    ws.on('open', () => {
      ws.send(JSON.stringify({ prompt: 'Hello', meta: 'invalid-meta!' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.error).toBe('Invalid meta');
    });

    ws.on('close', (code) => {
      expect(code).toBe(1008);
      done();
    });
  });

  it('should accept valid prompt and meta', (done) => {
    const ws = new WebSocket('ws://localhost:3001/ws/claude');
    let messageReceived = false;

    ws.on('open', () => {
      // First we'll receive the info message
    });

    ws.on('message', (data) => {
      const str = data.toString();
      try {
        const msg = JSON.parse(str);
        if (msg.info) {
          // Send valid prompt after receiving info
          ws.send(JSON.stringify({ prompt: 'Hello', meta: 'TASK-123' }));
        } else {
          messageReceived = true;
        }
      } catch {
        // Non-JSON response from Claude
        messageReceived = true;
      }
    });

    ws.on('close', (_code) => {
      expect(messageReceived).toBe(true);
      done();
    });

    // Timeout test after 10 seconds
    setTimeout(() => {
      ws.close();
      done();
    }, 10000);
  });
});
