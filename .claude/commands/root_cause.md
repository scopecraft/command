# Root Cause Analysis (RCA) Methodology

## Overview

This document provides a systematic approach to performing thorough root cause analysis for software bugs and system failures. The methodology emphasizes tracing data flow, creating visual diagrams, and identifying the exact point of failure.

## RCA Process Steps

### Phase 1: Problem Setup and Planning

1. **Create a Todo List for Systematic Tracking**
   ```markdown
   - [ ] Check file system - verify basic preconditions
   - [ ] Test direct API/function calls to isolate the issue
   - [ ] Examine core logic - find where the problem originates
   - [ ] Trace data flow - map the complete request/response path
   - [ ] Create visual diagram - document findings
   ```

2. **Define the Problem Statement**
   - What is the expected behavior?
   - What is the actual behavior?
   - What specific error messages or symptoms are observed?

### Phase 2: Systematic Investigation

#### Step 1: Verify Basic Preconditions
- File system checks (permissions, existence, accessibility)
- Configuration validation
- Environment verification
- Network connectivity (if applicable)

#### Step 2: Direct API Testing
- Call the failing function/API directly with minimal parameters
- Isolate the failure point from UI/client layers
- Capture exact error messages and stack traces

#### Step 3: Code Flow Analysis
- Identify entry points and trace execution path
- Use search tools to find relevant functions and files
- Read source code to understand intended behavior
- Look for conditional logic that might be taking wrong paths

#### Step 4: Data Flow Tracing
- Track how data moves through the system
- Identify transformation points
- Look for data corruption or incorrect assumptions
- Check validation and sanitization points

### Phase 3: Visual Documentation

#### Create ASCII Flow Diagrams

Use this template structure:

```ascii
CLIENT/USER REQUEST: [specific request details]
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER NAME (e.g., API GATEWAY, MCP HANDLER)               │
│  📁 file_path:line_number                                   │
│                                                             │
│  function_name(params):                                     │
│  1️⃣ Step description                                        │
│  2️⃣ Another step                                           │
│  3️⃣ 🔥 PROBLEM: Description of where it goes wrong         │
│     → Details of the issue                                  │
│     → Why this causes the failure 💥                       │
│  4️⃣ Incorrect result/behavior                              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
[Continue to next layer...]
```

#### Diagram Elements and Symbols

- `📁` - File path reference
- `1️⃣2️⃣3️⃣` - Sequential steps
- `🔥💥` - Problem indicators
- `✅❌` - Success/failure states
- `→` - Flow direction or consequence
- `│▼` - Vertical flow
- Box borders for component boundaries

#### Key Sections to Include

1. **Request Entry Point** - Where the problem starts
2. **Layer-by-Layer Flow** - Each processing stage
3. **Problem Identification** - Exact failure point
4. **Correct Flow** - How it should work
5. **Root Cause Summary** - The fundamental issue

### Phase 4: Root Cause Identification

#### Look for Common Patterns

1. **Configuration Issues**
   - Missing or incorrect configuration values
   - Environment-specific settings
   - Default values that don't match expectations

2. **Data Corruption**
   - Incorrect assumptions about data format
   - Missing validation or sanitization
   - State pollution from previous operations

3. **Logic Errors**
   - Wrong conditional branches
   - Incorrect algorithm implementation
   - Edge cases not handled

4. **Integration Issues**
   - API contract mismatches
   - Version incompatibilities
   - Timing or race conditions

5. **File System Issues**
   - Permission problems
   - Path resolution errors
   - Missing or corrupted files

#### Root Cause Validation

- Can you reproduce the issue consistently?
- Does fixing the identified cause resolve the problem?
- Are there other symptoms that this cause would explain?
- Is this a symptom of a deeper architectural issue?

### Phase 5: Documentation and Communication

#### Structure Your Findings

```markdown
## Root Cause Analysis Summary

**Problem**: [Brief description]
**Root Cause**: [The fundamental issue]
**Impact**: [What systems/users are affected]
**Fix**: [Specific corrective action needed]

### Investigation Process
[Link to or embed your ASCII flow diagram]

### Key Files Involved
- `file1.ts:line` - [Description of role in the problem]
- `file2.ts:line` - [Description of role in the problem]

### Validation Steps
1. [How to reproduce the issue]
2. [How to verify the fix]
```

## Best Practices

### Do's
- ✅ Use TodoWrite to track investigation progress
- ✅ Test assumptions with direct function calls
- ✅ Create visual diagrams for complex flows
- ✅ Include specific file paths and line numbers
- ✅ Mark completed investigation steps
- ✅ Validate your root cause hypothesis

### Don'ts
- ❌ Jump to conclusions without systematic investigation
- ❌ Skip basic precondition checks
- ❌ Ignore error messages or stack traces
- ❌ Focus only on symptoms instead of underlying causes
- ❌ Create diagrams that are too high-level to be useful

## Tools and Techniques

### Essential Tools
- `Task` tool for complex code searches
- `Read` tool for examining specific files
- `Bash` tool for direct system testing
- `TodoWrite/TodoRead` for progress tracking

### Investigation Techniques
- **Binary Search**: Eliminate half the possible causes with each test
- **Divide and Conquer**: Break complex systems into smaller testable parts
- **Trace Backwards**: Start from the error and work backwards to the cause
- **Comparative Analysis**: Compare working vs. failing scenarios

### Code Analysis Patterns
- Look for recent changes in git history
- Check for configuration or environment differences
- Examine error handling and validation logic
- Trace data transformations and type conversions

## Example RCA Template

```markdown
## Root Cause Analysis: [Problem Description]

### Problem Statement
- Expected: [What should happen]
- Actual: [What actually happens]
- Error: [Specific error message]

### Investigation Progress
- [x] Basic file system checks
- [x] Direct API testing
- [x] Code flow analysis
- [x] Data flow tracing
- [x] Visual documentation

### Flow Diagram
[ASCII diagram here]

### Root Cause
**File**: `path/to/file.ts:line`
**Issue**: [Specific problem description]
**Why**: [Explanation of why this causes the observed behavior]

### Fix
[Specific corrective action needed]

### Validation
[How to verify the fix works]
```

This methodology ensures systematic, thorough investigation while creating clear documentation that can be referenced later or shared with team members.