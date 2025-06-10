# Analyze current environment/config class dependencies and usage patterns

---
type: chore
status: done
area: core
assignee: research-agent
tags:
  - 'team:architecture'
  - 'expertise:researcher'
  - 'execution:autonomous'
  - 'parallel-group:research'
---


## Instruction
Analyze the current environment and configuration class-based architecture to understand dependencies, usage patterns, and migration complexity.

### Research Focus

1. **Class Dependency Mapping**
   - Map all 15+ classes in `/src/core/environment/` and `/src/core/config/`
   - Identify dependency chains and circular dependencies
   - Find all import/usage points across the codebase

2. **Interface Analysis**
   - Document public APIs of key classes (ConfigurationManager, WorktreeManager, etc.)
   - Identify which methods are actually used vs just theoretical
   - Find core functionality vs helper/utility methods

3. **Migration Complexity Assessment**
   - Identify breaking changes required for functional conversion
   - Find areas where singleton patterns are problematic
   - Assess backward compatibility challenges

### Key Areas to Investigate

- `ConfigurationManager` singleton usage patterns
- `WorktreeManager`/`WorktreePathResolver` interaction complexity  
- Environment service factory patterns vs simple functions
- Cross-dependencies between config and environment classes

### Deliverable Format

Create a comprehensive analysis document with:
- Dependency graph (ASCII or structured text)
- Current API surface area documentation
- Migration complexity scoring (high/medium/low per component)
- Recommended conversion order (least to most disruptive)

## Tasks

## Deliverable
# Environment/Config Class Architecture Analysis

### Executive Summary

Analyzed the current class-based architecture in `/src/core/environment/` and `/src/core/config/` to understand dependencies, usage patterns, and migration complexity for functional conversion. Found 9 core classes with heavy singleton patterns and complex interdependencies affecting 26+ usage points across the codebase.

### Dependency Graph

```
ConfigurationManager (Singleton)
├── Used by: WorktreeManager
├── Used by: WorktreePathResolver  
├── Used by: EnvironmentResolver
├── Used by: ProjectConfig
├── Used by: 22+ CLI/MCP handlers
└── Dependencies: None (config types only)

WorktreeManager
├── Dependencies: ConfigurationManager, WorktreePathResolver, BranchNamingService
├── Used by: EnvironmentResolver
├── Used by: CLI env commands
└── Used by: CLI work commands

EnvironmentResolver
├── Dependencies: WorktreeManager, BranchNamingService, ConfigurationManager
├── Used by: CLI env commands
└── Used by: CLI work commands

WorktreePathResolver
├── Dependencies: ConfigurationManager
└── Used by: WorktreeManager

BranchNamingService
├── Dependencies: None
├── Used by: WorktreeManager
├── Used by: EnvironmentResolver
└── Used by: ModeDefaultsService

Configuration Services (4 classes)
├── BranchNamingService: LOW coupling
├── DockerConfigService: LOW coupling  
├── ModeDefaultsService: MEDIUM coupling (Task dependency)
└── OutputFormatService: LOW coupling

ProjectConfig
├── Dependencies: ConfigurationManager
└── Used by: MCP handlers
```

### Current API Surface Area Documentation

### ConfigurationManager (Singleton Pattern)
**Core Public API:**
- `getInstance()` - Singleton access (26+ usage points)
- `getRootConfig(runtime?)` - Primary root resolution 
- `setRootFromCLI(path)` - CLI parameter setting
- `setRootFromSession(path)` - Session-based configuration
- `validateRoot(path)` - Path validation
- `getProjects()` - Project listing
- `clearSessionConfig()` - Session cleanup

**Usage Complexity:** HIGH - Singleton pattern used throughout codebase

### WorktreeManager 
**Core Public API:**
- `create(taskId, options?)` - Worktree creation
- `remove(taskId)` - Worktree removal  
- `list()` - Active worktree listing
- `exists(taskId)` - Existence checking
- `getWorktreePath(taskId)` - Async path resolution

**Usage Complexity:** MEDIUM - Mostly used in env/work commands

### EnvironmentResolver
**Core Public API:**
- `resolveEnvironmentId(taskId)` - Task-to-environment mapping
- `ensureEnvironment(envId)` - Environment creation/access
- `getEnvironmentInfo(envId)` - Information retrieval
- `ensureTaskEnvironment(taskId)` - Helper for task workflows

**Usage Complexity:** MEDIUM - Used in env/work workflows

### Configuration Services (4 classes)
**Low coupling, simple APIs:**
- `BranchNamingService`: Branch pattern management
- `DockerConfigService`: Docker configuration
- `ModeDefaultsService`: Work mode inference  
- `OutputFormatService`: CLI output formatting

### Migration Complexity Assessment

### HIGH Complexity Components

**ConfigurationManager** - COMPLEXITY: 🔴 HIGH
- **Breaking Changes:** Singleton pattern removal affects 26+ files
- **Singleton Dependencies:** All environment classes depend on getInstance()
- **Cross-module Usage:** CLI, MCP, Core, Tests all use singleton
- **State Management:** Internal caching, session config complexity
- **Migration Challenge:** Need functional alternative for stateful configuration

### MEDIUM Complexity Components

**WorktreeManager** - COMPLEXITY: 🟡 MEDIUM  
- **Constructor Injection:** Already supports dependency injection
- **Limited Usage:** Primarily env/work commands (8 files)
- **Git Dependencies:** Simple-git integration is functional-friendly
- **Migration Path:** Convert to functions accepting config parameter

**EnvironmentResolver** - COMPLEXITY: 🟡 MEDIUM
- **Constructor Injection:** Already supports dependency injection
- **Cross-dependencies:** Depends on WorktreeManager and ConfigurationManager
- **Usage Scope:** Limited to environment commands
- **Migration Path:** Convert to functions with explicit dependencies

**ProjectConfig** - COMPLEXITY: 🟡 MEDIUM
- **Singleton Alternative:** Has getInstance() but supports construction
- **Configuration Wrapper:** Wraps ConfigurationManager singleton
- **Limited Scope:** Used in MCP handlers and core utilities
- **Migration Path:** Convert to functional config resolution

### LOW Complexity Components

**WorktreePathResolver** - COMPLEXITY: 🟢 LOW
- **Simple Dependencies:** Only depends on ConfigurationManager
- **Pure Logic:** Path resolution is inherently functional
- **Limited Usage:** Only used by WorktreeManager
- **Migration Path:** Convert to pure functions easily

**Configuration Services (4 classes)** - COMPLEXITY: 🟢 LOW
- **Minimal Dependencies:** BranchNamingService, DockerConfigService have none
- **Stateless Logic:** Pure configuration/formatting functions
- **Clear Boundaries:** Well-separated concerns
- **Migration Path:** Direct conversion to exported functions

### Recommended Conversion Order (Least to Most Disruptive)

### Phase 1: Low-Risk Foundation (Week 1)
1. **Configuration Services** → Functional exports
   - Convert BranchNamingService, DockerConfigService, OutputFormatService
   - Create `src/core/config/services/` with functional exports
   - Zero breaking changes (maintain class exports for compatibility)

2. **WorktreePathResolver** → Pure functions
   - Convert to `src/core/environment/path-utils.ts`
   - Functions: `getWorktreeBasePath(config)`, `getWorktreePath(config, taskId)`
   - Update WorktreeManager to use functions

### Phase 2: Mid-Risk Business Logic (Week 2)
3. **WorktreeManager** → Functional worktree operations
   - Convert to `src/core/environment/worktree-ops.ts` 
   - Functions: `createWorktree(config, taskId, options)`, `removeWorktree(config, taskId)`
   - Maintain class wrapper for backward compatibility

4. **EnvironmentResolver** → Functional environment operations
   - Convert to `src/core/environment/env-ops.ts`
   - Functions: `resolveEnvironmentId(config, taskId)`, `ensureEnvironment(config, envId)`
   - Update CLI commands to use functional versions

### Phase 3: High-Risk Core Infrastructure (Week 3)
5. **ProjectConfig** → Functional project utilities
   - Convert to `src/core/project-utils.ts`
   - Functions: `getProjectPaths(config)`, `initializeProject(config)`
   - Eliminate singleton dependency

6. **ConfigurationManager** → Functional config resolution
   - **HIGHEST RISK** - Affects 26+ files
   - Convert to `src/core/config/config-resolver.ts`
   - Functions: `resolveRootConfig(runtime?)`, `validateProjectRoot(path)`
   - Create compatibility layer for gradual migration
   - Requires coordinated update across CLI, MCP, Core modules

### Migration Strategy Notes

**Backward Compatibility:**
- Phase 1-2: Maintain class exports alongside functional versions
- Phase 3: Provide compatibility wrappers during transition
- Gradual migration allows feature work to continue

**Testing Strategy:**
- Unit tests for functional versions alongside class tests
- Integration tests to verify CLI/MCP functionality  
- E2E tests remain unchanged during transition

**Risk Mitigation:**
- ConfigurationManager conversion requires feature freeze
- Staged rollout with fallback capability
- Comprehensive testing before singleton removal

### Key Architectural Insights

1. **Singleton Bottleneck**: ConfigurationManager singleton is the primary migration challenge
2. **Functional Readiness**: Most business logic is already functional-friendly
3. **Dependency Injection**: Existing constructor injection simplifies conversion
4. **Clean Boundaries**: Configuration services have minimal cross-dependencies
5. **Migration Feasibility**: Functional conversion is viable with 3-phase approach

### Recommendations

1. **Start with Configuration Services** - Quick wins with zero risk
2. **Parallel Function Development** - Build functional versions alongside classes
3. **Gradual CLI Migration** - Update commands one at a time to use functions
4. **Defer Singleton Removal** - Keep ConfigurationManager singleton until Phase 3
5. **Test Coverage** - Ensure comprehensive testing before each phase

This analysis provides the foundation for systematic migration from class-based to functional architecture while maintaining system stability and development velocity.

## Log
- 2025-06-09: 2025-06-09 17:43: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_anal-curr-envi-06J (Analyze current environment/config class dependencies and usage patterns)
  - Analysis: Type=chore, Area=core, Tags=[team:architecture, expertise:researcher, execution:autonomous, parallel-group:research]
  - Selected Mode: EXPLORATION (research/analysis task with deliverable focused on documentation)
  - Reasoning: Task involves mapping dependencies, analyzing APIs, and creating analysis documentation - classic exploration work
  - Loading: Exploration mindset focused on understanding and comprehensive research
- 2025-06-09: 2025-06-09 17:45: === EXPLORATION IN PROGRESS ===
  - Mapped directory structure: 6 environment files, 3 config files 
  - Analyzed key classes: ConfigurationManager (singleton), WorktreeManager, EnvironmentResolver
  - Found 26 usage points for ConfigurationManager, 8 for WorktreeManager
  - Identified dependency patterns: Heavy singleton usage, complex inter-class dependencies
  - Creating comprehensive analysis deliverable with dependency graph and migration strategy
- 2025-06-09: 2025-06-09 17:56: === EXECUTION COMPLETE ===
  - Mode Used: EXPLORATION
  - Status: COMPLETED
  - Deliverable: READY
  - Analysis completed: 9 core classes mapped, 26+ usage points identified
  - Dependency graph created with ASCII visualization
  - Migration complexity assessed: HIGH (ConfigMgr), MEDIUM (Worktree/Env), LOW (Services)
  - 3-phase migration strategy developed (3 weeks, least-to-most disruptive)
  - Key insight: Singleton pattern is primary challenge, functional conversion viable
  - Follow-up: Ready for functional architecture design phase
