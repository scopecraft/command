#!/usr/bin/env bun
/**
 * Test script for MCP configuration commands
 * Demonstrates how to use init_root, get_current_root, and list_projects
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Create a test project directory
const testDir = path.join(os.tmpdir(), 'mcp-config-test');
const testProject = path.join(testDir, 'test-project');

console.log('Setting up test project...');
fs.mkdirSync(path.join(testProject, '.tasks'), { recursive: true });

// Create a test task
const taskPath = path.join(testProject, '.tasks', 'TEST-001.md');
fs.writeFileSync(taskPath, `+++
id = "TEST-001"
title = "Test Task in Configured Project"
type = "test"
status = "🟡 To Do"
+++

# Test Task in Configured Project

This task should be visible when using the configured root.`);

// Create a config file with multiple projects
const configDir = path.join(os.homedir(), '.scopecraft');
const configFile = path.join(configDir, 'config.json');

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const config = {
  version: '1.0.0',
  projects: [
    {
      name: 'test-project',
      path: testProject,
      description: 'Test project for MCP config demo'
    },
    {
      name: 'current-project',
      path: process.cwd(),
      description: 'Current working directory'
    }
  ],
  defaultProject: 'test-project'
};

fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

console.log('\n=== MCP Configuration Commands Demo ===\n');

// Start the MCP server in background
console.log('Starting MCP server...');
const serverProcess = execSync('bun src/mcp/stdio-cli.ts', {
  stdio: 'ignore',
  detached: true
});

// Give server time to start
setTimeout(() => {
  console.log('\n1. Testing get_current_root command:');
  console.log('   This should show the current auto-detected root');
  console.log('   Run: mcp.get_current_root\n');

  console.log('2. Testing list_projects command:');
  console.log('   This should list the projects from config file');
  console.log('   Run: mcp.list_projects\n');

  console.log('3. Testing init_root command:');
  console.log(`   This sets the project root to: ${testProject}`);
  console.log(`   Run: mcp.init_root { "path": "${testProject}" }\n`);

  console.log('4. Testing task_list after init_root:');
  console.log('   This should show the test task from the configured project');
  console.log('   Run: mcp.task_list\n');

  console.log('5. Testing get_current_root after init:');
  console.log('   This should show the newly configured root');
  console.log('   Run: mcp.get_current_root\n');

  console.log('=== Demo Complete ===\n');
  console.log('The MCP server is running. You can test these commands using your MCP client.');
  console.log('Press Ctrl+C to stop the server.\n');
  
  // Clean up on exit
  process.on('SIGINT', () => {
    console.log('\nCleaning up...');
    fs.rmSync(testDir, { recursive: true, force: true });
    process.exit(0);
  });
}, 1000);