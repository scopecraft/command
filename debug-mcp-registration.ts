#!/usr/bin/env bun

// Debug what the MCP server actually registers
import { createServerInstance } from './src/mcp/core-server.js';

const server = createServerInstance();

// Get the registered tools
const tools = server.list();

console.log('Registered tools:');
tools.forEach(tool => {
  if (tool.name === 'task_create') {
    console.log('task_create tool found:');
    console.log('  name:', tool.name);
    console.log('  description:', tool.description);
    console.log('  inputSchema keys:', Object.keys(tool.inputSchema || {}));
    
    // Check the specific input schema for our problematic fields
    if (tool.inputSchema) {
      console.log('\nInput schema details:');
      ['type', 'status', 'priority'].forEach(field => {
        const fieldSchema = tool.inputSchema[field];
        if (fieldSchema) {
          console.log(`  ${field}:`, {
            typeName: fieldSchema._def?.typeName,
            description: fieldSchema._def?.description || fieldSchema.description,
            // Check if it's an enum
            values: fieldSchema._def?.values
          });
        }
      });
    }
  }
});