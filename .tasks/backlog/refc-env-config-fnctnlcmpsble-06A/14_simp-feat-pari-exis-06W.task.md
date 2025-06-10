# Remove overengineered features from TRD, keep alignment improvements

---
type: chore
status: done
area: core
assignee: design-agent
tags:
  - simplification
  - design-refinement
  - 'execution:autonomous'
---


## Instruction
Remove the overengineered features from the TRD while keeping the good architectural alignment improvements like naming conventions and structure.

### Context

The TRD review added too many new features we're not ready for (orchestration state, session coordination, storage adapters, etc.), but it also made some good improvements to naming and architectural alignment that we want to keep.

### TRD Location

**Document to Refine**: `TRD-ExecutionContext-Functional-API-Design.md` in this parent task folder

### Refinement Requirements

#### 1. Remove Overengineered Features

Remove these additions that go beyond feature parity:
- ❌ orchestrationState in ExecutionContext
- ❌ sessionCoordination with resource limits
- ❌ templateContext 
- ❌ storageConfig
- ❌ Service registry pattern
- ❌ Approval gates and monitoring configs
- ❌ All the complex supporting types
- ❌ Capability detection
- ❌ Storage adapter interfaces
- ❌ Complex serialization options

#### 2. Keep Good Alignment Improvements

Retain these beneficial changes:
- ✅ Better module structure that aligns with architecture docs
- ✅ Clearer naming conventions
- ✅ Service boundary definitions (without the complex registry)
- ✅ Improved file organization
- ✅ Architecture alignment notes
- ✅ Clear migration path

#### 3. Simplify ExecutionContext

Return to core requirements only:
```typescript
export interface ExecutionContext {
  // Execution environment
  executionPath: string;           // Where the process is running
  processId?: string;              // Process identifier
  
  // Project context  
  projectRoot: string;             // Where project data lives
  projectSource: ConfigSource;     // How it was determined
  projectValidated: boolean;       // Validation status
  
  // Task context
  taskDataRoot: string;            // Where task data is stored
  currentTaskId?: string;          // Current task
  parentTaskId?: string;           // Parent for inheritance
  
  // Session context
  sessionRoot: string;             // Where sessions are stored
  sessionId?: string;              // Current session
  
  // Inheritance
  parentContext?: ExecutionContext; // For context propagation
}
```

#### 4. Keep APIs Simple

Functional replacements should be direct equivalents:
- ConfigurationManager methods → configuration functions
- WorktreeManager methods → worktree functions
- Simple context inheritance for orchestration fix
- Basic serialization for process boundaries

#### 5. Maintain Architecture Alignment

Keep the good parts:
- Module structure that follows `/docs/02-architecture/code-organization.md`
- Service boundaries that prepare for future extraction (without complex patterns)
- Naming that aligns with architectural vision
- Notes about how this fits the bigger picture

### What Makes This Different

The original TRD was good. The architect's review added:
- ❌ Too many features (orchestration, templates, storage, etc.)
- ✅ Better naming and structure alignment

We want to keep the alignment improvements while removing the feature creep.

### Success Criteria

- TRD maintains 1:1 feature parity with existing system
- Naming and structure align with architecture docs
- No new capabilities beyond fixing the dual-context bug
- Clean module organization
- Practical, implementable design

### Deliverable

**Direct edits** to the TRD document:
1. Remove all ENHANCED sections and new features
2. Keep architectural alignment improvements
3. Maintain clean structure and good naming
4. Add a note explaining this is Phase 1 - feature parity only

## Tasks

## Deliverable
**TRD Successfully Simplified**

The TRD-ExecutionContext-Functional-API-Design.md document has been refined to remove overengineered features while preserving architectural improvements:

**✅ Removed Overengineered Features:**
- All ENHANCED sections and complex supporting types
- orchestrationState, sessionCoordination, templateContext, storageConfig from ExecutionContext
- Service registry pattern, storage adapters, approval gates
- Template management APIs, capability detection
- Complex orchestration and storage examples

**✅ Preserved Good Alignment:**
- Clean module structure that aligns with architecture docs
- Better naming conventions and service boundary definitions
- Pure function patterns and explicit context passing
- Architecture alignment review notes

**✅ Maintained Core Requirements:**
- Simplified ExecutionContext interface (as specified in task)
- Basic context inheritance for orchestration fix
- Direct functional API replacements for singletons
- Clean migration path and compatibility strategy

**✅ Added Phase 1 Focus:**
- Clear statement that this is feature parity only
- Note that advanced features are deferred to future phases
- Emphasis on practical, implementable design

The TRD now maintains 1:1 feature parity with existing system while improving architecture alignment, exactly as requested.

## Log
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 05_simp-feat-pari-exis-06W
  - Analysis: type:chore, area:core, tags:[simplification, design-refinement, execution:autonomous]
  - Selected Mode: Design (TRD variant)
  - Reasoning: TRD refinement work involving architectural decisions about feature scope
  - Loading: design/trd.md, guidance/architecture-patterns.md
- 2025-06-09: Located TRD document. Current state has extensive enhancements:
  - Orchestration state, session coordination, template integration
  - Storage adapters, service registry patterns
  - Complex capability detection and monitoring
  - Multiple ENHANCED sections throughout
  
  Starting simplification to remove overengineered features while preserving:
  - Good module structure alignment
  - Clear naming conventions  
  - Service boundary definitions
  - Architecture alignment notes
- 2025-06-09: TRD simplification completed successfully:
  
  **Removed Overengineered Features:**
  - orchestrationState, sessionCoordination, templateContext, storageConfig
  - ApprovalGate, ResourceLimits, MonitoringConfig, StorageAdapter interfaces
  - Service registry pattern, capability detection
  - Template management, storage integration APIs
  - Complex examples with orchestration/template features
  
  **Kept Good Alignment Improvements:**
  - Clean module structure aligning with architecture docs
  - Clear naming conventions and service boundaries
  - Pure function patterns and context propagation
  - Architecture alignment notes and migration path
  
  **Added Phase 1 Focus:**
  - Clear note that this is feature parity only
  - Simplified ExecutionContext interface
  - Basic context inheritance for orchestration fix
  - Practical, implementable design
- 2025-06-09: === EXECUTION COMPLETE ===
  - Mode Used: Design (TRD variant)
  - Status: COMPLETED
  - Deliverable: READY
  - Questions: None (straightforward simplification task)
  - Follow-up: TRD is now ready for implementation in Phase 1
  
  Successfully removed overengineered features while preserving the good architectural alignment improvements. The document now focuses on feature parity with clean design patterns.
