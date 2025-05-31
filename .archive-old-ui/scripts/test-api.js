// Simple test script to verify the API server and client integration

async function testApi() {
  const API_BASE_URL = 'http://localhost:3000/api';
  
  console.log('🧪 Starting API integration tests');
  
  try {
    // Test 1: Fetch tasks
    console.log('\n📋 Test 1: Fetch tasks');
    const tasksResponse = await fetch(`${API_BASE_URL}/tasks?include_content=true&include_completed=true`);
    
    if (!tasksResponse.ok) {
      throw new Error(`Failed to fetch tasks: ${tasksResponse.status} ${tasksResponse.statusText}`);
    }
    
    const tasksResult = await tasksResponse.json();
    
    if (!tasksResult.success) {
      throw new Error(`API returned error: ${tasksResult.message || tasksResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched ${tasksResult.data.length} tasks`);
    
    // Test 2: Fetch phases
    console.log('\n📋 Test 2: Fetch phases');
    const phasesResponse = await fetch(`${API_BASE_URL}/phases`);
    
    if (!phasesResponse.ok) {
      throw new Error(`Failed to fetch phases: ${phasesResponse.status} ${phasesResponse.statusText}`);
    }
    
    const phasesResult = await phasesResponse.json();
    
    if (!phasesResult.success) {
      throw new Error(`API returned error: ${phasesResult.message || phasesResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched ${phasesResult.data.length} phases`);
    
    // Test 3: Create a test task
    console.log('\n📋 Test 3: Create a task');
    const createTaskResponse = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Test Task ${new Date().toISOString()}`,
        type: '📋 Task',
        status: '🟡 To Do',
        priority: '▶️ Medium',
        content: 'This is a test task created by the API integration test script'
      })
    });
    
    if (!createTaskResponse.ok) {
      throw new Error(`Failed to create task: ${createTaskResponse.status} ${createTaskResponse.statusText}`);
    }
    
    const createTaskResult = await createTaskResponse.json();
    
    if (!createTaskResult.success) {
      throw new Error(`API returned error: ${createTaskResult.message || createTaskResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully created task with ID ${createTaskResult.data.metadata.id}`);
    
    const createdTaskId = createTaskResult.data.metadata.id;
    
    // Test 4: Fetch the created task
    console.log('\n📋 Test 4: Fetch a specific task');
    const fetchTaskResponse = await fetch(`${API_BASE_URL}/tasks/${createdTaskId}`);
    
    if (!fetchTaskResponse.ok) {
      throw new Error(`Failed to fetch task: ${fetchTaskResponse.status} ${fetchTaskResponse.statusText}`);
    }
    
    const fetchTaskResult = await fetchTaskResponse.json();
    
    if (!fetchTaskResult.success) {
      throw new Error(`API returned error: ${fetchTaskResult.message || fetchTaskResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched task with ID ${fetchTaskResult.data.metadata.id}`);
    
    // Test 5: Update the created task
    console.log('\n📋 Test 5: Update a task');
    const updateTaskResponse = await fetch(`${API_BASE_URL}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metadata: {
          status: '🔵 In Progress',
          priority: '🔼 High'
        },
        content: 'This task has been updated by the API integration test script'
      })
    });
    
    if (!updateTaskResponse.ok) {
      throw new Error(`Failed to update task: ${updateTaskResponse.status} ${updateTaskResponse.statusText}`);
    }
    
    const updateTaskResult = await updateTaskResponse.json();
    
    if (!updateTaskResult.success) {
      throw new Error(`API returned error: ${updateTaskResult.message || updateTaskResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully updated task with ID ${updateTaskResult.data.metadata.id}`);
    
    // Test 6: Delete the created task
    console.log('\n📋 Test 6: Delete a task');
    const deleteTaskResponse = await fetch(`${API_BASE_URL}/tasks/${createdTaskId}`, {
      method: 'DELETE'
    });
    
    if (!deleteTaskResponse.ok) {
      throw new Error(`Failed to delete task: ${deleteTaskResponse.status} ${deleteTaskResponse.statusText}`);
    }
    
    const deleteTaskResult = await deleteTaskResponse.json();
    
    if (!deleteTaskResult.success) {
      throw new Error(`API returned error: ${deleteTaskResult.message || deleteTaskResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully deleted task with ID ${createdTaskId}`);
    
    // All tests passed
    console.log('\n🎉 All API integration tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ API integration test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
testApi();