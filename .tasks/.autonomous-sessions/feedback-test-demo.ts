#!/usr/bin/env bun

/**
 * Demo script to test the feedback flow mechanism
 * This simulates what happens when an autonomous task needs feedback
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const DEMO_OUTPUT_FILE = 'feedback-test-results.txt';

async function simulateTaskWithFeedback() {
  console.log('🚀 Starting feedback flow test...\n');
  
  // Phase 1: Initial work
  console.log('📝 Phase 1: Performing initial task operations...');
  await fs.appendFile(DEMO_OUTPUT_FILE, '=== FEEDBACK FLOW TEST ===\n');
  await fs.appendFile(DEMO_OUTPUT_FILE, 'Phase 1: Initial work completed\n');
  
  // Simulate decision point
  console.log('\n❓ Decision Point Reached:');
  console.log('   - Option A: Use simple implementation');
  console.log('   - Option B: Use advanced implementation with caching');
  console.log('\n⏸️  Task requires feedback to continue...');
  
  // Document the question in output
  await fs.appendFile(DEMO_OUTPUT_FILE, '\nQUESTION: Which implementation approach?\n');
  await fs.appendFile(DEMO_OUTPUT_FILE, '- Option A: Simple implementation\n');
  await fs.appendFile(DEMO_OUTPUT_FILE, '- Option B: Advanced with caching\n');
  await fs.appendFile(DEMO_OUTPUT_FILE, 'STATUS: Awaiting feedback...\n');
  
  // Simulate saving state for continuation
  const stateFile = '.feedback-test-state.json';
  const state = {
    phase: 'awaiting_feedback',
    work_completed: ['initial_setup', 'analysis'],
    pending_decision: 'implementation_approach',
    timestamp: new Date().toISOString()
  };
  
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
  console.log('\n💾 State saved for continuation');
  console.log(`📋 To continue: implement-auto --continue test-feedback-flow-05A "Use Option B"`);
}

async function continueFeedback(feedback: string) {
  console.log('🔄 Continuing with feedback:', feedback);
  
  // Load saved state
  const stateFile = '.feedback-test-state.json';
  try {
    const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    console.log('📂 Loaded saved state from:', state.timestamp);
    
    // Phase 2: Continue based on feedback
    await fs.appendFile(DEMO_OUTPUT_FILE, '\nPhase 2: Continuing with feedback\n');
    await fs.appendFile(DEMO_OUTPUT_FILE, `Feedback received: ${feedback}\n`);
    
    if (feedback.toLowerCase().includes('option b') || feedback.toLowerCase().includes('advanced')) {
      console.log('✅ Using advanced implementation with caching');
      await fs.appendFile(DEMO_OUTPUT_FILE, 'Decision: Advanced implementation selected\n');
      await fs.appendFile(DEMO_OUTPUT_FILE, 'Implementing caching layer...\n');
    } else {
      console.log('✅ Using simple implementation');
      await fs.appendFile(DEMO_OUTPUT_FILE, 'Decision: Simple implementation selected\n');
    }
    
    // Complete the task
    await fs.appendFile(DEMO_OUTPUT_FILE, 'Task completed successfully!\n');
    console.log('\n🎉 Task completed!');
    
    // Clean up state
    await fs.unlink(stateFile);
    console.log('🧹 Cleaned up state file');
    
  } catch (error) {
    console.error('❌ Error loading state:', error);
    console.log('💡 Run the initial task first');
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.includes('--continue')) {
  const feedbackIndex = args.indexOf('--continue') + 1;
  const feedback = args.slice(feedbackIndex).join(' ') || 'No feedback provided';
  await continueFeedback(feedback);
} else {
  await simulateTaskWithFeedback();
}