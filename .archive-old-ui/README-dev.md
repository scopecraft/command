# Development Setup for Tasks UI

This document explains the new development setup that runs the API server and Vite dev server separately.

## Architecture

- **API Server (Bun)**: Runs on port 8888 in development mode
- **Vite Dev Server**: Runs on port 5173 with hot module replacement
- **Proxy Configuration**: Vite proxies all `/api` and `/ws` requests to the API server

## Scripts

### Run Both Servers (Recommended)
```bash
bun run ui:dev
```
This starts both the API server and Vite dev server concurrently.

### Run Servers Individually
```bash
# API Server only (port 8888)
bun run ui:dev:api

# Vite UI only (port 5173)
bun run ui:dev:ui
```

## How It Works

1. **API Server** (`server.ts`):
   - In development mode (`NODE_ENV=development`), it runs on port 8888
   - Only serves API endpoints and WebSocket connections
   - Does NOT serve static files in dev mode

2. **Vite Dev Server** (`vite.config.ts`):
   - Runs on port 5173 with hot module replacement
   - Proxies `/api/*` requests to `http://localhost:8888`
   - Proxies `/ws/*` WebSocket connections to `ws://localhost:8888`

## Benefits

- **Hot Module Replacement**: UI changes instantly reflect without page reload
- **API Isolation**: API server can be restarted without affecting UI
- **Better Development Experience**: Vite's fast builds and HMR
- **Debugging**: Easier to debug API and UI separately

## Production Mode

In production, the server runs on port 3000 and serves both API and static files:
```bash
bun run build  # Build the UI
bun run start  # Start production server
```

## Troubleshooting

### Port Already in Use
If port 8888 is already in use, you can specify a different port:
```bash
PORT=9999 bun run ui:dev:api
```
Then update `vite.config.ts` to proxy to the new port.

### WebSocket Connection Issues
Ensure both servers are running and the proxy configuration in `vite.config.ts` matches the API server port.