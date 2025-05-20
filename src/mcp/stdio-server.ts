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

  // No logging output to avoid interfering with MCP protocol

  // Create the server instance
  const server = createServerInstance(options);

  // Connect the transport to the server
  await server.connect(transport);

}
