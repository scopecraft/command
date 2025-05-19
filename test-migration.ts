#!/usr/bin/env bun
import { migrateSystemDirectories } from './src/core/task-manager/directory-utils.js';

console.log('Testing directory migration...');

try {
  // Run the migration
  migrateSystemDirectories();
  console.log('Migration completed!');
} catch (error) {
  console.error('Migration failed:', error);
}