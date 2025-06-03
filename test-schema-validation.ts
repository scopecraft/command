#!/usr/bin/env bun

// Test that our input schemas actually accept aliases
import { TaskTypeInputSchema, TaskStatusInputSchema, TaskPriorityInputSchema } from './src/mcp/schemas.js';

console.log('Testing input schemas...');

try {
  console.log('Testing TaskTypeInputSchema with "feat":');
  const typeResult = TaskTypeInputSchema.parse('feat');
  console.log('✅ Success:', typeResult);
} catch (error) {
  console.log('❌ Failed:', error.message);
}

try {
  console.log('Testing TaskStatusInputSchema with "wip":');
  const statusResult = TaskStatusInputSchema.parse('wip');
  console.log('✅ Success:', statusResult);
} catch (error) {
  console.log('❌ Failed:', error.message);
}

try {
  console.log('Testing TaskPriorityInputSchema with "p2":');
  const priorityResult = TaskPriorityInputSchema.parse('p2');
  console.log('✅ Success:', priorityResult);
} catch (error) {
  console.log('❌ Failed:', error.message);
}

// Also test the descriptions
console.log('\nSchema descriptions:');
console.log('Type:', TaskTypeInputSchema.description);
console.log('Status:', TaskStatusInputSchema.description);
console.log('Priority:', TaskPriorityInputSchema.description);