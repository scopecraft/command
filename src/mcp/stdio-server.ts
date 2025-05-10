/**
 * STDIO MCP server implementation
 * Uses the StdioServerTransport for terminal-based interaction
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServerInstance } from './core-server.js';

/**
 * Start a STDIO MCP server
 * @param options Additional options
 * @returns A Promise that resolves when the server is closed
 */
export async function startStdioServer(options: { 
  verbose?: boolean 
} = {}): Promise<void> {
  // Create the transport
  const transport = new StdioServerTransport();
  
  if (options.verbose) {
    console.log("Creating STDIO MCP server transport");
  }
  
  // Create the server instance
  const server = createServerInstance(options);
  
  // Connect the transport to the server
  await server.connect(transport);
  
  console.log("STDIO MCP Server running");
  console.log("Use Ctrl+C to stop the server");
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('Shutting down STDIO server...');
    await server.close();
    console.log('Server shutdown complete');
    process.exit(0);
  });
  
  // Keep the process alive
  return new Promise((resolve) => {
    // This promise intentionally never resolves to keep the process running
  });
}