# Fix remaining TypeScript errors in MCP layer

---
type: bug
status: Done
area: mcp
---


## Instruction
Fix remaining TypeScript errors in MCP layer after CRUD refactoring. Total: 42 errors across 4 main areas.

## Tasks
- [x] Fix handlers.ts void return type errors
- [x] Fix output-schemas.ts Zod description placement
- [x] Fix normalized-write-handlers.ts type assertion errors
- [x] Fix string vs string[] type mismatches
- [x] Fix parameter ordering in function calls
- [x] Fix parameter-transformer.ts type guard
- [x] Apply proper const assignment pattern for data access
- [x] Remove unsafe type assertions

## Deliverable
**All MCP TypeScript Errors Fixed**

### Issues Resolved:
1. **handlers.ts (2 errors)**: Fixed void return from initializeProjectStructure by wrapping in try-catch
2. **output-schemas.ts (8 errors)**: Fixed Zod schema descriptions by using .describe() on schemas instead of zodToJsonSchema options
3. **normalized-write-handlers.ts (11 errors)**:
   - Fixed type assertions by removing unsafe `as Type['data']['field']` patterns
   - Fixed string vs string[] mismatch by parsing markdown checklist to array
   - Fixed parameter ordering in core.update calls (config vs parentId)
   - Applied consistent data access pattern with proper null checks
4. **parameter-transformer.ts (1 error)**: Added type guard for camelcaseKeys parameter

### Patterns Applied:
- Used `.describe()` method for Zod schema descriptions
- Applied const assignment pattern after null checks
- Removed unsafe type assertions in favor of direct access
- Proper parameter ordering for core function calls
- Type guards for unknown parameters

### Verification:
- All MCP files now compile without TypeScript errors
- Maintained proper API functionality
- Preserved schema descriptions for better MCP tooling

## Log
- 2025-06-02: Starting TypeScript error fixes in MCP layer - checking current error state
- 2025-06-02: Fixed all TypeScript errors in MCP layer - handlers.ts void returns, output-schemas.ts descriptions, normalized-write-handlers.ts type assertions, and parameter-transformer.ts type checking. MCP layer now compiles without errors.

## Error analysis by file:
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

## Implementation notes:
- Fixed optional chaining pattern using const assignment (best practice per TypeScript guidelines)
- Pattern: After `if (!result.success || !result.data) return`, assign `const data = result.data`
- This pattern already applied to 6 instances in normalized-write-handlers.ts

## Priority:
Should be fixed before metadata refactor (task 12) to ensure clean baseline for testing.
