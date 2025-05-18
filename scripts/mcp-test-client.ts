#!/usr/bin/env bun
/**
 * Simple MCP test client for testing configuration commands
 * This demonstrates how to interact with the MCP server
 */

import { spawn } from 'node:child_process';
import readline from 'node:readline';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

class McpTestClient {
  private serverProcess: any;
  private rl: readline.Interface;
  private messageId = 1;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start() {
    console.log(`${colors.blue}Starting MCP Server...${colors.reset}`);
    
    // Start the MCP server
    this.serverProcess = spawn('bun', ['src/mcp/stdio-cli.ts'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    this.serverProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`${colors.gray}Server: ${output}${colors.reset}`);
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`${colors.green}MCP Server started!${colors.reset}`);
    console.log(`${colors.yellow}Available commands:${colors.reset}`);
    console.log('  1. init_root <path>     - Set project root');
    console.log('  2. get_current_root     - Get current root configuration');
    console.log('  3. list_projects        - List configured projects');
    console.log('  4. task_list            - List tasks (to test root config)');
    console.log('  5. exit                 - Exit the client\n');

    this.prompt();
  }

  private prompt() {
    this.rl.question(`${colors.blue}mcp> ${colors.reset}`, async (input) => {
      const [command, ...args] = input.trim().split(' ');

      switch (command) {
        case 'init_root':
          if (args.length === 0) {
            console.log(`${colors.red}Error: Please provide a path${colors.reset}`);
          } else {
            await this.sendRequest('init_root', { path: args.join(' ') });
          }
          break;

        case 'get_current_root':
          await this.sendRequest('get_current_root', {});
          break;

        case 'list_projects':
          await this.sendRequest('list_projects', {});
          break;

        case 'task_list':
          await this.sendRequest('task_list', {});
          break;

        case 'exit':
          this.exit();
          return;

        default:
          console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
      }

      this.prompt();
    });
  }

  private async sendRequest(method: string, params: any) {
    const request = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method,
      params,
    };

    console.log(`${colors.gray}Sending: ${JSON.stringify(request, null, 2)}${colors.reset}`);
    
    // In a real implementation, you would send this to the server via STDIO
    // For this demo, we'll simulate the response
    console.log(`${colors.green}Request sent to server${colors.reset}`);
    
    // Simulate response handling
    setTimeout(() => {
      console.log(`${colors.gray}Response would appear here${colors.reset}\n`);
    }, 100);
  }

  private exit() {
    console.log(`${colors.yellow}Shutting down...${colors.reset}`);
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    this.rl.close();
    process.exit(0);
  }
}

// Run the test client
const client = new McpTestClient();
client.start().catch(console.error);