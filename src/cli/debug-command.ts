#!/usr/bin/env node
import { program } from 'commander';
import { updateTaskDebug } from '../core/task-manager/task-crud-debug.js';

// Direct debug command for testing
program
  .command('debug-update <id>')
  .description('Debug update a task')
  .option('--status <status>', 'Task status')
  .action(async (id, options) => {
    console.log('Running debug update with:', id, options);
    
    // Create updates object
    const updates: any = {};
    
    if (options.status) {
      console.log('Setting status to:', options.status);
      updates.status = options.status;
    }
    
    const result = await updateTaskDebug(id, updates);
    
    if (result.success) {
      console.log('Success:', result.message);
      console.log('Updated task:', JSON.stringify(result.data, null, 2));
    } else {
      console.error('Error:', result.error);
    }
  });

program.parse(process.argv);