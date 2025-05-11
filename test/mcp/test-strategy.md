# MCP Server Test Strategy

This document outlines the high-level strategy for testing the MCP (Model Context Protocol) server implementation, focusing initially on the STDIO transport. The strategy provides a structured approach to ensure comprehensive testing of all functionality while minimizing test setup complexity.

## 1. Testing Goals

- Verify all MCP methods function correctly
- Ensure consistent error handling across methods
- Validate mode detection and operation in both standalone and Roo Commander modes
- Identify any issues with the STDIO transport implementation
- Establish a foundation for later StreamableHTTP transport testing

## 2. Test Environment

### 2.1 Isolated Test Phase

To avoid affecting real project data, we'll create a dedicated test phase:

- Create a phase named `test-mcp-{timestamp}` to ensure uniqueness
- All test tasks will be created within this phase
- After testing, the phase and its contents can be deleted manually through the file system

### 2.2 Mode Testing

For mode detection testing:
- Initial tests will use whatever mode the project is currently in
- Specific mode tests will use the `--mode` flag to override detection

## 3. Test Categories

### 3.1 Server Initialization and Configuration

Test the server's ability to start correctly with various configurations:
- Basic initialization
- Verbose mode
- Mode override

### 3.2 Task Operations

Test the core CRUD operations for tasks:
- Task listing (with and without filters)
- Task retrieval
- Task creation (with minimal and full metadata)
- Task updating (metadata and content)
- Task deletion

### 3.3 Phase Operations

Test phase management functionality:
- Phase listing
- Phase creation

### 3.4 Workflow Operations

Test workflow-specific functionality:
- Finding the next task (with and without current task)
- Identifying current workflow
- Marking tasks complete and finding the next task

### 3.5 Error Handling

Test the server's response to invalid inputs:
- Non-existent resources
- Missing required fields
- Invalid field values

## 4. Testing Approach

### 4.1 Manual Testing with MCP Tools

The initial testing will use the MCP tools directly:
- Using Claude's ability to call MCP methods directly
- Following a structured prompt-based test plan
- Validating results based on expected outputs

### 4.2 Test Sequence

Tests will be organized in a logical sequence:
1. Start with initialization tests
2. Proceed to phase creation (for test isolation)
3. Test task CRUD operations
4. Test workflow operations
5. Test error handling scenarios

### 4.3 Result Validation

For each test case, validation will include:
- Verifying the method returns the expected success/error status
- Checking that the data structure matches expectations
- Confirming that filesystem changes occurred as expected
- Testing dependent operations to ensure consistency

## 5. Documentation

### 5.1 Test Results

Test results will be documented with:
- Test case ID and description
- MCP method and parameters used
- Actual result received
- Pass/fail assessment
- Any unexpected behavior or issues

### 5.2 Issue Tracking

Issues discovered during testing will be:
- Documented with reproduction steps
- Categorized by severity and component
- Tracked for resolution

## 6. Follow-up Testing

After addressing any issues found:
- Regression testing will verify fixes
- The same test plan will be expanded for StreamableHTTP transport

## 7. Implemented Test Scripts

### 7.1 Token Optimization Test Script

The `task-list-token-optimization.test.ts` script was created to verify the optimizations made to the MCP `task_list` method. This script:

1. **Tests different parameter combinations**:
   - Default behavior (no parameters): Verifies content is excluded and completed tasks are filtered out
   - `include_content=true`: Tests that content is included while still filtering completed tasks
   - `include_completed=true`: Tests that completed tasks are included while still excluding content
   - Both parameters enabled: Tests that both content and completed tasks are included

2. **Measures and compares response sizes** for each scenario, calculating the percentage reduction in size achieved by the optimizations.

3. **Validates implementation correctness** through specific assertions:
   - Verifies that content is excluded by default
   - Confirms content is included when requested
   - Ensures completed tasks are excluded by default
   - Checks that completed tasks are included when requested
   - Validates that task counts change appropriately based on filters
   - Verifies response size reduction between default and full responses

This script provides quantitative evidence of optimization effectiveness, showing an 87.64% reduction in response size for the default case, which ensures the MCP server can work within Claude Code's token limits.

### 7.2 Future Expansion

This strategy and testing approach establishes a foundation that can be extended to:
- More comprehensive automated testing using a test framework
- Performance and stress testing
- Client-side SDK testing
- Comprehensive StreamableHTTP transport testing

By following this strategy, we can systematically validate the MCP server implementation and identify any issues that need to be addressed before expanding to more complex scenarios.