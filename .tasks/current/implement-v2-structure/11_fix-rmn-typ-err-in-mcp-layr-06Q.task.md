# Fix remaining TypeScript errors in MCP layer

---
type: bug
status: To Do
area: mcp
---


## Instruction
Fix remaining TypeScript errors in MCP layer after CRUD refactoring. Total: 42 errors across 4 main areas.

## Error Analysis by File:

### 1. src/mcp/handlers.ts (2 errors)
```
Line 83: Property 'success' does not exist on type 'void'
Line 86: Property 'error' does not exist on type 'void'
```
**Issue**: A function is returning void instead of OperationResult
**Solution**: Find the function being called and ensure it returns proper result object

### 2. src/mcp/output-schemas.ts (8 errors) 
```
Lines 25,30,35,40,49,54,59,64: Object literal may only specify known properties, and 'description' does not exist in type 'Partial<Options<"jsonSchema7">>'
```
**Issue**: Zod schema options don't accept 'description' property
**Solution**: Remove or move description to proper location in schema definition

### 3. src/mcp/normalized-write-handlers.ts (11 errors)
**Pattern 1: Type assertions on undefined types**
```
Lines 97,100,148,151,628,630: Property 'type'/'workflowState' does not exist on type '... | undefined'
```
**Issue**: Type assertions like `TaskCreateOutput['data']['type']` when data might be undefined
**Solution**: Update type definitions or use safer type assertions

**Pattern 2: Type mismatches**
```
Line 123: Type 'string | undefined' is not assignable to type 'string[] | undefined'
Lines 228,599: Argument of type 'string | undefined' is not assignable to parameter of type 'ProjectConfig | undefined'/'string'
```
**Issue**: deliverable expects string[] but getting string; rootDir being passed where ProjectConfig expected
**Solution**: Fix type mismatches in function calls

**Pattern 3: Output data access**
```
Lines 374,668: Property does not exist on type '... | undefined'
```
**Issue**: Similar to result.data pattern but with outputData variable
**Solution**: Apply same const assignment pattern

### 4. src/core/worktree/task-correlation-service.ts (29 errors)
- Using old API patterns
- Already tracked in separate task: refc-work-dash-for-v2-05A

### 5. Other files (2 errors)
- src/core/formatters.ts: Fixed during review
- src/cli/commands.ts: Fixed during review

## Implementation Notes:
- Fixed optional chaining pattern using const assignment (best practice per TypeScript guidelines)
- Pattern: After `if (!result.success || !result.data) return`, assign `const data = result.data`
- This pattern already applied to 6 instances in normalized-write-handlers.ts

## Priority:
Should be fixed before metadata refactor (task 12) to ensure clean baseline for testing.

## Tasks

## Deliverable

## Log
