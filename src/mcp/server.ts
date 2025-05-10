/**
 * MCP server implementation
 * Using the official MCP SDK with StreamableHTTP transport
 */
import { startHttpServer } from './http-server.js';

const DEFAULT_PORT = 3500;

/**
 * Start the MCP server
 * @param port Port to listen on
 * @returns A Promise that resolves when the server is started
 */
export async function startServer(port: number = DEFAULT_PORT): Promise<any> {
  console.log(`Starting MCP server with SDK implementation on port ${port}...`);
  return await startHttpServer(port, { verbose: true });
}