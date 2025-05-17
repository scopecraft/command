# WebSocket Claude Integration

This feature adds a WebSocket endpoint at `/ws/claude` that allows streaming communication with the Claude CLI.

## Testing the WebSocket Endpoint

### 1. Start the server

```bash
bun run ./tasks-ui/server.ts
```

### 2. Open the demo page

Open `tasks-ui/ws-demo.html` in your browser, or navigate to:
```
http://localhost:3000/ws-demo.html
```

### 3. Using wscat for testing

Install wscat if you don't have it:
```bash
npm install -g wscat
```

Test the endpoint:
```bash
# Connect
wscat -c ws://localhost:3000/ws/claude

# Send a valid prompt
{"prompt":"Hello Claude","meta":"TASK-123"}

# Test invalid JSON
invalid json

# Test missing prompt
{"meta":"TASK-123"}

# Test invalid meta
{"prompt":"Hello","meta":"invalid!"}
```

### 4. Run automated tests

```bash
bun test test/websocket-claude.test.ts
```

## API Specification

- **URL**: `ws://localhost:3000/ws/claude`
- **Input**: JSON object with `prompt` and `meta` fields
- **Output**: Streaming JSON lines from Claude CLI
- **Errors**: JSON object with `error` field
- **Timeout**: 5 minutes

## Example Usage

```javascript
const ws = new WebSocket('ws://localhost:3000/ws/claude');

ws.onopen = () => {
  ws.send(JSON.stringify({
    prompt: "Write a hello world function in Python",
    meta: "TASK-123"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

ws.onclose = (event) => {
  console.log(`Connection closed with code ${event.code}`);
};
```