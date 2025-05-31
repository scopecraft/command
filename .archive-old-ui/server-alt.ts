// Alternative implementation using Bun's recommended Response API
import { serve } from 'bun';
import { streamClaude } from './streamClaude.js';

serve({
  port: 3000,
  
  websocket: {
    open(ws) {
      ws.send(JSON.stringify({ info: "send {prompt,meta}" }));
    },

    async message(ws, data) {
      let env;
      try { 
        env = JSON.parse(data as string); 
      } catch { 
        ws.send(JSON.stringify({ error: "Bad JSON" }));
        ws.close(1008);
        return;
      }
      
      if (!env.prompt || typeof env.prompt !== 'string' || env.prompt.length > 8192) {
        ws.send(JSON.stringify({ error: "Invalid prompt" }));
        ws.close(1008);
        return;
      }
      
      if (!env.meta || !/^[A-Z0-9_\-]+$/.test(env.meta)) {
        ws.send(JSON.stringify({ error: "Invalid meta" }));
        ws.close(1008);
        return;
      }

      const full = `${env.prompt}\n\n[meta:${env.meta}]`;
      const proc = streamClaude(full);
      const timeout = setTimeout(() => { 
        proc.kill(); 
        ws.close(1011, "Timeout");
      }, 300_000);

      // Alternative approach using Bun's stream utilities
      // Read stdout
      (async () => {
        try {
          const text = await Bun.readableStreamToText(proc.stdout);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              ws.send(line);
            }
          }
        } catch (error) {
          console.error('Error reading stdout:', error);
        }
      })();

      // Read stderr
      (async () => {
        try {
          const errors = await Bun.readableStreamToText(proc.stderr);
          if (errors) {
            ws.send(JSON.stringify({ error: errors }));
          }
        } catch (error) {
          console.error('Error reading stderr:', error);
        }
      })();
      
      proc.exited.then((code) => { 
        clearTimeout(timeout); 
        ws.close(code ? 1011 : 1000);
      });
    }
  }
});