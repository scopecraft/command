#!/usr/bin/env bun

import { spawn } from 'child_process';

// Test data with aliases
const testRequest = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "task_create",
    arguments: {
      title: "Test MCP alias support",
      type: "feat",        // alias for "feature"
      priority: "p2",      // alias for "high"
      status: "wip",       // alias for "in_progress"
      area: "testing"
    }
  },
  id: 1
};

// Spawn MCP server
const mcp = spawn('bun', ['run', 'dev:mcp:stdio'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let error = '';

mcp.stdout.on('data', (data) => {
  output += data.toString();
});

mcp.stderr.on('data', (data) => {
  error += data.toString();
});

mcp.on('close', (code) => {
  console.log('MCP process exited with code:', code);
  
  try {
    // Parse the JSON-RPC response
    const response = JSON.parse(output);
    
    if (response.error) {
      console.error('❌ MCP returned error:', JSON.stringify(response.error, null, 2));
      process.exit(1);
    }
    
    if (response.result?.content?.[0]?.text) {
      const result = JSON.parse(response.result.content[0].text);
      
      if (result.success) {
        console.log('✅ Success! Task created with aliases normalized:');
        console.log('   - Type: feat → feature');
        console.log('   - Priority: p2 → high');
        console.log('   - Status: wip → in_progress');
        console.log('\nCreated task:', result.data);
      } else {
        console.error('❌ Task creation failed:', result.error);
      }
    }
  } catch (e) {
    console.error('Failed to parse response:', e);
    console.error('Raw output:', output);
    console.error('Raw error:', error);
  }
});

// Send the test request
mcp.stdin.write(JSON.stringify(testRequest) + '\n');
mcp.stdin.end();