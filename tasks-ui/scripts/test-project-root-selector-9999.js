#!/usr/bin/env node
// Test script for ProjectRootSelector on port 9999
// This script performs both API and UI interaction tests

import { fetch } from 'bun';

const API_URL = 'http://localhost:9999/api';

// Test cases to check the ProjectRootSelector functionality
async function main() {
  console.log('Testing ProjectRootSelector on port 9999...');
  console.log('============================================');
  
  // Basic API tests
  await testApiEndpoint();
  
  // UI testing guidance - can't be automated easily
  console.log('\nManual UI Testing Steps:');
  console.log('=======================');
  console.log('1. Open browser to http://localhost:9999');
  console.log('2. Verify ProjectRootSelector appears in the header');
  console.log('3. Test dropdown opens with all project roots');
  console.log('4. Select different project roots and verify URL changes');
  console.log('5. Verify content refreshes with the selected project root');
  console.log('6. Test keyboard navigation of dropdown (Tab, Enter, Escape, Arrow keys)');
  console.log('7. Check mobile responsiveness with browser dev tools');
  console.log('8. Open in multiple tabs to test state persistence');
  
  console.log('\nSee issues found in testing in project-root-selector-issues.md');
}

// Test the /project-roots endpoint
async function testApiEndpoint() {
  console.log('\nAPI Endpoint Test:');
  console.log('----------------');
  
  try {
    console.log('Testing /project-roots endpoint...');
    const response = await fetch(`${API_URL}/project-roots`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`API returned error: ${result.message || 'Unknown error'}`);
    }
    
    console.log(`✓ Successfully fetched ${result.data.length} project roots`);
    
    // Validate response format
    if (!Array.isArray(result.data)) {
      throw new Error('API response data is not an array');
    }
    
    // Validate each project root has the required fields
    for (const root of result.data) {
      if (!root.id) {
        throw new Error('Project root missing required "id" field');
      }
      if (!root.name) {
        throw new Error('Project root missing required "name" field');
      }
      console.log(`  - Root "${root.name}" (${root.id})`);
    }
    
    // Test task fetch with each project root
    console.log('\nTesting task fetch with each project root:');
    for (const root of result.data) {
      try {
        const taskResponse = await fetch(`${API_URL}/tasks?root_id=${root.id}`);
        
        if (!taskResponse.ok) {
          console.log(`  ✗ Failed to fetch tasks for root "${root.name}": ${taskResponse.status}`);
          continue;
        }
        
        const taskResult = await taskResponse.json();
        
        if (!taskResult.success) {
          console.log(`  ✗ Error fetching tasks for root "${root.name}": ${taskResult.message}`);
          continue;
        }
        
        console.log(`  ✓ Root "${root.name}": ${taskResult.data?.length || 0} tasks found`);
      } catch (error) {
        console.log(`  ✗ Error testing root "${root.name}": ${error.message}`);
      }
    }
    
    console.log('\n✓ API endpoint tests completed');
    
  } catch (error) {
    console.error(`✗ API test failed: ${error.message}`);
  }
}

// Run the tests
main().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});