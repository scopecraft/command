#!/usr/bin/env node
// Debug script to verify that rootId is being passed correctly to the API
// Run with: bun run tasks-ui/scripts/debug-api-root-id.js

async function debugApiWithRootId() {
  // Test with local server running on port 9999
  const baseUrl = 'http://localhost:9999/api';
  const rootId = 'e2e'; // Test with e2e root ID
  
  console.log('Testing API calls with root_id parameter...');
  
  try {
    // Test /tasks endpoint with root_id
    console.log('\n1. Testing /tasks with root_id...');
    const tasksUrl = `${baseUrl}/tasks?root_id=${rootId}`;
    console.log(`   URL: ${tasksUrl}`);
    
    const tasksResponse = await fetch(tasksUrl);
    if (!tasksResponse.ok) {
      throw new Error(`HTTP error! Status: ${tasksResponse.status}`);
    }
    
    const tasksData = await tasksResponse.json();
    console.log(`   Success: ${tasksData.success}`);
    console.log(`   Found ${tasksData.data?.length || 0} tasks`);
    
    // Sample the first few tasks to verify they're from the correct root
    if (tasksData.data && tasksData.data.length > 0) {
      console.log('\n   Sample tasks:');
      const sampleSize = Math.min(3, tasksData.data.length);
      for (let i = 0; i < sampleSize; i++) {
        const task = tasksData.data[i];
        console.log(`   - Task ID: ${task.metadata?.id || task.id}`);
        console.log(`     Title: ${task.metadata?.title || task.title}`);
        console.log(`     File Path: ${task.filePath}`);
        console.log('');
      }
    }
    
    // Test /features endpoint with root_id
    console.log('\n2. Testing /features with root_id...');
    const featuresUrl = `${baseUrl}/features?root_id=${rootId}`;
    console.log(`   URL: ${featuresUrl}`);
    
    const featuresResponse = await fetch(featuresUrl);
    if (!featuresResponse.ok) {
      throw new Error(`HTTP error! Status: ${featuresResponse.status}`);
    }
    
    const featuresData = await featuresResponse.json();
    console.log(`   Success: ${featuresData.success}`);
    console.log(`   Found ${featuresData.data?.length || 0} features`);
    
    // Test /areas endpoint with root_id
    console.log('\n3. Testing /areas with root_id...');
    const areasUrl = `${baseUrl}/areas?root_id=${rootId}`;
    console.log(`   URL: ${areasUrl}`);
    
    const areasResponse = await fetch(areasUrl);
    if (!areasResponse.ok) {
      throw new Error(`HTTP error! Status: ${areasResponse.status}`);
    }
    
    const areasData = await areasResponse.json();
    console.log(`   Success: ${areasData.success}`);
    console.log(`   Found ${areasData.data?.length || 0} areas`);
    
    // Test /phases endpoint with root_id
    console.log('\n4. Testing /phases with root_id...');
    const phasesUrl = `${baseUrl}/phases?root_id=${rootId}`;
    console.log(`   URL: ${phasesUrl}`);
    
    const phasesResponse = await fetch(phasesUrl);
    if (!phasesResponse.ok) {
      throw new Error(`HTTP error! Status: ${phasesResponse.status}`);
    }
    
    const phasesData = await phasesResponse.json();
    console.log(`   Success: ${phasesData.success}`);
    console.log(`   Found ${phasesData.data?.length || 0} phases`);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing API with root_id:', error);
  }
}

debugApiWithRootId();