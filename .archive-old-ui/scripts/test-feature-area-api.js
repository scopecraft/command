// Test script to verify the Feature and Area API functionality

async function testFeatureAreaApi() {
  const API_BASE_URL = 'http://localhost:3000/api';
  
  console.log('🧪 Starting Feature and Area API tests');
  
  try {
    // Test 1: Fetch features
    console.log('\n📋 Test 1: Fetch features');
    const featuresResponse = await fetch(`${API_BASE_URL}/features?include_progress=true`);
    
    if (!featuresResponse.ok) {
      throw new Error(`Failed to fetch features: ${featuresResponse.status} ${featuresResponse.statusText}`);
    }
    
    const featuresResult = await featuresResponse.json();
    
    if (!featuresResult.success) {
      throw new Error(`API returned error: ${featuresResult.message || featuresResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched ${featuresResult.data.length} features`);
    
    // Test 2: Fetch areas
    console.log('\n📋 Test 2: Fetch areas');
    const areasResponse = await fetch(`${API_BASE_URL}/areas?include_progress=true`);
    
    if (!areasResponse.ok) {
      throw new Error(`Failed to fetch areas: ${areasResponse.status} ${areasResponse.statusText}`);
    }
    
    const areasResult = await areasResponse.json();
    
    if (!areasResult.success) {
      throw new Error(`API returned error: ${areasResult.message || areasResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched ${areasResult.data.length} areas`);
    
    // Test 3: Create a test feature
    console.log('\n📋 Test 3: Create a test feature');
    const featureId = `TestFeature${Date.now()}`;
    const createFeatureResponse = await fetch(`${API_BASE_URL}/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: featureId,
        title: `Test Feature ${new Date().toISOString()}`,
        description: 'This is a test feature created by the API test script',
        phase: 'TEST'
      })
    });
    
    if (!createFeatureResponse.ok) {
      throw new Error(`Failed to create feature: ${createFeatureResponse.status} ${createFeatureResponse.statusText}`);
    }
    
    const createFeatureResult = await createFeatureResponse.json();
    
    if (!createFeatureResult.success) {
      throw new Error(`API returned error: ${createFeatureResult.message || createFeatureResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully created feature with ID ${createFeatureResult.data.id}`);
    
    // Test 4: Create a test area
    console.log('\n📋 Test 4: Create a test area');
    const areaId = `TestArea${Date.now()}`;
    const createAreaResponse = await fetch(`${API_BASE_URL}/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: areaId,
        title: `Test Area ${new Date().toISOString()}`,
        description: 'This is a test area created by the API test script',
        phase: 'TEST'
      })
    });
    
    if (!createAreaResponse.ok) {
      throw new Error(`Failed to create area: ${createAreaResponse.status} ${createAreaResponse.statusText}`);
    }
    
    const createAreaResult = await createAreaResponse.json();
    
    if (!createAreaResult.success) {
      throw new Error(`API returned error: ${createAreaResult.message || createAreaResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully created area with ID ${createAreaResult.data.id}`);
    
    // Test 5: Fetch specific feature
    console.log('\n📋 Test 5: Fetch specific feature');
    const featureFullId = `FEATURE_${featureId}`;
    const getFeatureResponse = await fetch(`${API_BASE_URL}/features/${featureFullId}`);
    
    if (!getFeatureResponse.ok) {
      throw new Error(`Failed to fetch feature: ${getFeatureResponse.status} ${getFeatureResponse.statusText}`);
    }
    
    const getFeatureResult = await getFeatureResponse.json();
    
    if (!getFeatureResult.success) {
      throw new Error(`API returned error: ${getFeatureResult.message || getFeatureResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched feature with ID ${getFeatureResult.data.id}`);
    
    // Test 6: Fetch specific area
    console.log('\n📋 Test 6: Fetch specific area');
    const areaFullId = `AREA_${areaId}`;
    const getAreaResponse = await fetch(`${API_BASE_URL}/areas/${areaFullId}`);
    
    if (!getAreaResponse.ok) {
      throw new Error(`Failed to fetch area: ${getAreaResponse.status} ${getAreaResponse.statusText}`);
    }
    
    const getAreaResult = await getAreaResponse.json();
    
    if (!getAreaResult.success) {
      throw new Error(`API returned error: ${getAreaResult.message || getAreaResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched area with ID ${getAreaResult.data.id}`);
    
    // Test 7: Create task in feature
    console.log('\n📋 Test 7: Create task in feature');
    const createTaskInFeatureResponse = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Test Task in Feature ${new Date().toISOString()}`,
        type: '📋 Task',
        status: '🟡 To Do',
        priority: '▶️ Medium',
        subdirectory: featureFullId,
        phase: 'TEST',
        content: 'This is a test task created by the API test script in a feature'
      })
    });
    
    if (!createTaskInFeatureResponse.ok) {
      throw new Error(`Failed to create task: ${createTaskInFeatureResponse.status} ${createTaskInFeatureResponse.statusText}`);
    }
    
    const createTaskInFeatureResult = await createTaskInFeatureResponse.json();
    
    if (!createTaskInFeatureResult.success) {
      throw new Error(`API returned error: ${createTaskInFeatureResult.message || createTaskInFeatureResult.error || 'Unknown error'}`);
    }
    
    const taskInFeatureId = createTaskInFeatureResult.data.metadata.id;
    console.log(`✅ Successfully created task in feature with ID ${taskInFeatureId}`);
    
    // Test 8: Create task in area
    console.log('\n📋 Test 8: Create task in area');
    const createTaskInAreaResponse = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Test Task in Area ${new Date().toISOString()}`,
        type: '📋 Task',
        status: '🟡 To Do',
        priority: '▶️ Medium',
        subdirectory: areaFullId,
        phase: 'TEST',
        content: 'This is a test task created by the API test script in an area'
      })
    });
    
    if (!createTaskInAreaResponse.ok) {
      throw new Error(`Failed to create task: ${createTaskInAreaResponse.status} ${createTaskInAreaResponse.statusText}`);
    }
    
    const createTaskInAreaResult = await createTaskInAreaResponse.json();
    
    if (!createTaskInAreaResult.success) {
      throw new Error(`API returned error: ${createTaskInAreaResult.message || createTaskInAreaResult.error || 'Unknown error'}`);
    }
    
    const taskInAreaId = createTaskInAreaResult.data.metadata.id;
    console.log(`✅ Successfully created task in area with ID ${taskInAreaId}`);
    
    // Test 9: Fetch tasks filtered by feature
    console.log('\n📋 Test 9: Fetch tasks filtered by feature');
    const tasksInFeatureResponse = await fetch(`${API_BASE_URL}/tasks?feature=${featureFullId}&include_content=true`);
    
    if (!tasksInFeatureResponse.ok) {
      throw new Error(`Failed to fetch tasks in feature: ${tasksInFeatureResponse.status} ${tasksInFeatureResponse.statusText}`);
    }
    
    const tasksInFeatureResult = await tasksInFeatureResponse.json();
    
    if (!tasksInFeatureResult.success) {
      throw new Error(`API returned error: ${tasksInFeatureResult.message || tasksInFeatureResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched ${tasksInFeatureResult.data.length} tasks in feature`);
    
    // Test 10: Fetch tasks filtered by area
    console.log('\n📋 Test 10: Fetch tasks filtered by area');
    const tasksInAreaResponse = await fetch(`${API_BASE_URL}/tasks?area=${areaFullId}&include_content=true`);
    
    if (!tasksInAreaResponse.ok) {
      throw new Error(`Failed to fetch tasks in area: ${tasksInAreaResponse.status} ${tasksInAreaResponse.statusText}`);
    }
    
    const tasksInAreaResult = await tasksInAreaResponse.json();
    
    if (!tasksInAreaResult.success) {
      throw new Error(`API returned error: ${tasksInAreaResult.message || tasksInAreaResult.error || 'Unknown error'}`);
    }
    
    console.log(`✅ Successfully fetched ${tasksInAreaResult.data.length} tasks in area`);
    
    // Test 11: Clean up - Delete test tasks
    console.log('\n📋 Test 11: Delete test tasks');
    const deleteTask1Response = await fetch(`${API_BASE_URL}/tasks/${taskInFeatureId}`, {
      method: 'DELETE'
    });
    
    if (!deleteTask1Response.ok) {
      throw new Error(`Failed to delete task: ${deleteTask1Response.status} ${deleteTask1Response.statusText}`);
    }
    
    const deleteTask2Response = await fetch(`${API_BASE_URL}/tasks/${taskInAreaId}`, {
      method: 'DELETE'
    });
    
    if (!deleteTask2Response.ok) {
      throw new Error(`Failed to delete task: ${deleteTask2Response.status} ${deleteTask2Response.statusText}`);
    }
    
    console.log(`✅ Successfully deleted test tasks`);
    
    // Test 12: Clean up - Delete test feature and area
    console.log('\n📋 Test 12: Delete test feature and area');
    const deleteFeatureResponse = await fetch(`${API_BASE_URL}/features/${featureFullId}?force=true`, {
      method: 'DELETE'
    });
    
    if (!deleteFeatureResponse.ok) {
      throw new Error(`Failed to delete feature: ${deleteFeatureResponse.status} ${deleteFeatureResponse.statusText}`);
    }
    
    const deleteAreaResponse = await fetch(`${API_BASE_URL}/areas/${areaFullId}?force=true`, {
      method: 'DELETE'
    });
    
    if (!deleteAreaResponse.ok) {
      throw new Error(`Failed to delete area: ${deleteAreaResponse.status} ${deleteAreaResponse.statusText}`);
    }
    
    console.log(`✅ Successfully deleted test feature and area`);
    
    // All tests passed
    console.log('\n🎉 All Feature and Area API tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Feature and Area API test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
testFeatureAreaApi();