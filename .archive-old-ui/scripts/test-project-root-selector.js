// Test script for ProjectRootSelector
// This script verifies that the Project Roots API works correctly

import { fetch } from 'bun';

const API_URL = 'http://localhost:9999/api';

async function main() {
  console.log('Testing Project Roots API...');
  
  try {
    // Test fetching project roots
    console.log('\n1. Fetching project roots...');
    const response = await fetch(`${API_URL}/project-roots`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`API returned error: ${result.message || 'Unknown error'}`);
    }
    
    console.log('Success! Project roots fetched:', result.data);
    console.log(`Found ${result.data.length} project roots`);
    
    // Log each root
    result.data.forEach((root, index) => {
      console.log(`\nRoot #${index + 1}:`);
      console.log(`ID: ${root.id}`);
      console.log(`Name: ${root.name}`);
    });
    
    console.log('\nAll tests passed successfully!');
    console.log('The ProjectRootSelector component should be working correctly.');
    console.log('\nTo test the component in the UI:');
    console.log('1. Run the UI server: PORT=9999 bun run tasks-ui/server.ts');
    console.log('2. Open the UI in your browser: http://localhost:9999');
    console.log('3. Look for the project root selector in the header');
    console.log('4. Try selecting different project roots and verify navigation works');
    
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
}

main();