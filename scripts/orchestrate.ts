#!/usr/bin/env bun

import { session } from 'channelcoder';
import { parseArgs } from 'util';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'help': {
      type: 'boolean',
      short: 'h',
    },
    'dry-run': {
      type: 'boolean',
      short: 'd',
    },
  },
  strict: true,
  allowPositionals: true,
});

// Show help
if (values.help || positionals.length === 0) {
  console.log(`${colors.cyan}${colors.bright}Task Orchestrator${colors.reset}`);
  console.log('\nUsage:');
  console.log('  orchestrate <parentId>           Run orchestration for parent task');
  console.log('  orchestrate <parentId> --dry-run Show what would be dispatched');
  console.log('\nExamples:');
  console.log('  # Orchestrate a multi-phase feature');
  console.log('  orchestrate ui-redesign-06A');
  console.log('\n  # See what would be dispatched without running');
  console.log('  orchestrate ui-redesign-06A --dry-run');
  console.log('\nOptions:');
  console.log('  -d, --dry-run  Show dispatch plan without executing');
  console.log('  -h, --help     Show this help message');
  console.log('\nNote: This reads orchestration flows and dispatches work using ./auto');
  process.exit(0);
}

// Execute orchestration
async function executeOrchestration(parentId: string, dryRun: boolean = false) {
  console.log(`\n${colors.cyan}${colors.bright}Task Orchestrator${colors.reset}`);
  console.log(`Parent Task: ${colors.bright}${parentId}${colors.reset}`);
  
  if (dryRun) {
    console.log(`${colors.yellow}DRY RUN MODE - No tasks will be dispatched${colors.reset}`);
  }
  
  try {
    // Create session for orchestration
    const s = session({
      name: `orchestrate-${parentId}-${Date.now()}`,
      autoSave: true,
    });
    
    console.log(`${colors.yellow}Reading orchestration flow...${colors.reset}`);
    
    // Build the prompt with parent context
    const promptFile = '.tasks/.modes/orchestration/base.md';
    
    // Execute orchestration mode
    const result = await s.run(promptFile, {
      data: {
        parentId,
        dryRun,
      },
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Orchestration completed${colors.reset}`);
      
      if (dryRun) {
        console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
        console.log(`  Review the orchestration plan above`);
        console.log(`  Run without --dry-run to execute: ${colors.bright}orchestrate ${parentId}${colors.reset}`);
      } else {
        console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
        console.log(`  Monitor dispatched tasks`);
        console.log(`  Check parent task for orchestration log`);
        console.log(`  Run orchestrate again when ready for next phase`);
      }
      
      return { success: true, parentId };
    } else {
      console.error(`${colors.red}❌ Orchestration failed: ${result.error}${colors.reset}`);
      return { success: false, parentId, error: result.error };
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Orchestration execution failed:${colors.reset}`, error);
    return { success: false, parentId, error };
  }
}

// Main execution
async function main() {
  const parentId = positionals[0];
  const dryRun = values['dry-run'] || false;
  
  await executeOrchestration(parentId, dryRun);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});