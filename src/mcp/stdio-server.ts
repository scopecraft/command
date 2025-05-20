/**
 * STDIO MCP server implementation
 * Uses the StdioServerTransport for terminal-based interaction
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServerInstance } from './core-server.js';

/**
 * Start a STDIO MCP server
 * @param options Additional options
 * @returns A Promise that resolves when the server is closed
 */
export async function startStdioServer(
  options: {
    verbose?: boolean;
  } = {}
): Promise<void> {
  // Create the transport
  const transport = new StdioServerTransport();

  if (options.verbose) {
    console.error('Creating STDIO MCP server transport');
  }

  // Create the server instance
  const server = createServerInstance(options);

  // Connect the transport to the server
  await server.connect(transport);

  console.error('STDIO MCP Server running');
  console.error('Use Ctrl+C to stop the server');

  // Handle process termination
  process.on('SIGINT', async () => {
    console.error('Shutting down STDIO server...');
    await server.close();
    console.error('Server shutdown complete');
    process.exit(0);
  });

  // Keep the process alive
  return new Promise((_resolve) => {
    // This promise intentionally never resolves to keep the process running
  });
}
