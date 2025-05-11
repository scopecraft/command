/**
 * Test script for task_list token optimization
 *
 * This script tests the optimization of token usage in the task_list MCP handler by:
 * 1. Testing inclusion/exclusion of task content
 * 2. Testing inclusion/exclusion of completed tasks
 * 3. Comparing response sizes and task counts
 */

import { listTasks } from '../src/core/task-manager';
import { TaskFilterOptions } from '../src/core/types';
import { handleTaskList } from '../src/mcp/handlers';
import { TaskListParams } from '../src/mcp/types';

async function runTest() {
  console.log('=== Testing task_list token optimization ===');

  // Array to store test results for comparison
  const results: Array<{
    testName: string;
    params: TaskListParams;
    taskCount: number;
    contentIncluded: boolean;
    completedTasksIncluded: boolean;
    responseSize: number;
  }> = [];

  // Test cases with different parameter combinations
  const testCases = [
    {
      testName: 'Default (exclude content & completed tasks)',
      params: {} as TaskListParams // Default behavior should exclude content and completed tasks
    },
    {
      testName: 'Include content only',
      params: { include_content: true } as TaskListParams
    },
    {
      testName: 'Include completed tasks only',
      params: { include_completed: true } as TaskListParams
    },
    {
      testName: 'Include both content and completed tasks',
      params: { include_content: true, include_completed: true } as TaskListParams
    }
  ];

  // Run each test case
  for (const testCase of testCases) {
    console.log(`\nRunning test: ${testCase.testName}`);

    // Call through the MCP handler to apply the default parameter values
    const result = await handleTaskList(testCase.params);
    
    if (!result.success) {
      console.error(`Test failed: ${result.error}`);
      continue;
    }
    
    const tasks = result.data;
    
    // Check if content is included
    const hasContent = tasks.length > 0 && 
      tasks.some(task => task.content && task.content.trim().length > 0);
    
    // Look for completed tasks
    const completedTaskCount = tasks.filter(task => {
      const status = task.metadata?.status || '';
      return status.includes('Done') || 
        status.includes('🟢') || 
        status.includes('Completed') || 
        status.includes('Complete');
    }).length;
    
    // Calculate response size (rough approximation of token count)
    const responseSize = JSON.stringify(tasks).length;
    
    // Log results
    console.log(`Tasks returned: ${tasks.length}`);
    console.log(`Has content: ${hasContent}`);
    console.log(`Completed tasks: ${completedTaskCount}`);
    console.log(`Response size (bytes): ${responseSize}`);
    
    // Store results for comparison
    results.push({
      testName: testCase.testName,
      params: testCase.params,
      taskCount: tasks.length,
      contentIncluded: hasContent,
      completedTasksIncluded: completedTaskCount > 0,
      responseSize
    });
  }
  
  // Compare results and print summary
  console.log('\n=== Test Summary ===');
  console.table(results);
  
  // Calculate size reduction percentage compared to full response
  const fullResponseSize = results.find(r => 
    r.params.include_content === true && r.params.include_completed === true
  )?.responseSize || 0;
  
  const defaultResponseSize = results.find(r => 
    !r.params.include_content && !r.params.include_completed
  )?.responseSize || 0;
  
  if (fullResponseSize > 0 && defaultResponseSize > 0) {
    const reductionPercentage = ((fullResponseSize - defaultResponseSize) / fullResponseSize * 100).toFixed(2);
    console.log(`\nToken optimization achieved: ~${reductionPercentage}% reduction in response size`);
  }
  
  // Verification of implementation correctness
  let passedTests = 0;
  let totalTests = 0;
  
  function assertTest(condition: boolean, message: string): boolean {
    totalTests++;
    if (condition) {
      console.log(`✅ ${message}`);
      passedTests++;
      return true;
    } else {
      console.error(`❌ ${message}`);
      return false;
    }
  }
  
  console.log('\n=== Implementation Verification ===');
  
  // Default behavior should exclude both content and completed tasks
  const defaultResult = results.find(r => !r.params.include_content && !r.params.include_completed);
  assertTest(!defaultResult?.contentIncluded, 'Default behavior correctly excludes content');
  
  // include_content=true should include content
  const contentResult = results.find(r => r.params.include_content === true);
  assertTest(contentResult?.contentIncluded, 'include_content=true correctly includes content');
  
  // include_completed=true should include completed tasks
  const completedResult = results.find(r => r.params.include_completed === true);
  const fullResult = results.find(r => 
    r.params.include_content === true && r.params.include_completed === true
  );
  
  // Only verify completed tasks were included if there are any completed tasks in the full result
  if (fullResult && fullResult.completedTasksIncluded) {
    assertTest(completedResult?.completedTasksIncluded, 'include_completed=true correctly includes completed tasks');
    
    // Task count should be higher when completed tasks are included
    assertTest(
      (completedResult?.taskCount || 0) > (defaultResult?.taskCount || 0),
      'More tasks are returned when include_completed=true'
    );
  } else {
    console.log('ℹ️ No completed tasks found in the tasks directory, skipping completed task tests');
  }
  
  // Response size tests
  assertTest(
    (defaultResult?.responseSize || 0) < (fullResult?.responseSize || 0),
    'Default response is smaller than full response'
  );
  
  console.log(`\nVerification complete: ${passedTests}/${totalTests} tests passed`);
}

// Run the tests
runTest().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});