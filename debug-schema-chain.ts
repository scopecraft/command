#!/usr/bin/env bun

import { TaskStatusInputSchema } from './src/mcp/schemas.js';
import { z } from 'zod';

// Test what happens when we chain operations
const baseSchema = TaskStatusInputSchema;
console.log('Base schema type:', baseSchema._def.typeName);

const withDefault = TaskStatusInputSchema.default('todo');
console.log('With default type:', withDefault._def.typeName);

const withOptional = TaskStatusInputSchema.default('todo').optional();
console.log('With optional type:', withOptional._def.typeName);

// Test validation
try {
  console.log('Testing base schema with "wip":', baseSchema.parse('wip'));
} catch (e) {
  console.log('Base schema failed:', e.message);
}

try {
  console.log('Testing chained schema with "wip":', withOptional.parse('wip'));
} catch (e) {
  console.log('Chained schema failed:', e.message);
}

// Check the internal definition
console.log('Base schema def:', JSON.stringify(baseSchema._def, null, 2).substring(0, 200));
console.log('Chained schema def:', JSON.stringify(withOptional._def, null, 2).substring(0, 200));