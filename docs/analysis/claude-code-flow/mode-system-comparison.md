# Scopecraft Modes vs Claude-Code-Flow SPARC: A Comparative Analysis

## Overview

This document compares Scopecraft's mode templates with Claude-Code-Flow's SPARC framework, analyzing their different approaches to AI agent specialization and task execution.

## 1. Architectural Philosophy

### Scopecraft Modes
- **Template-Based**: Markdown templates with YAML frontmatter
- **Context-Rich**: Extensive placeholders for customization
- **Task-Centric**: Modes are loaded based on task metadata
- **Flexible Roles**: Stakeholder context is customizable per project

### Claude-Code-Flow SPARC
- **Role-Based**: Fixed professional identities (coder, architect, etc.)
- **Tool-Centric**: Each mode has specific tool configurations
- **Memory-First**: All modes use shared memory for coordination
- **Standardized**: 17 pre-defined modes with consistent structure

## 2. Mode Structure Comparison

### Scopecraft Template Structure
```markdown
---
input:
  taskId: string
  parentId?: string
  taskInstruction: string
  additionalInstructions?: string
allowedTools:
  [comprehensive tool list]
---

<role>
<!-- PLACEHOLDER: Define stakeholder context -->
You have a stake in this project's success.
</role>

<principles>
[Mode-specific principles]
</principles>

<approach>
[Workflow steps]
</approach>

<deliverable>
[Expected output]
</deliverable>
```

### SPARC Mode Structure
```
# SPARC Development Mode: {mode.name}

## Your Role
{mode.roleDefinition}

## Your Task
{taskDescription}

## Mode-Specific Instructions
{mode.customInstructions}

## SPARC Development Environment
[Tools, memory integration, best practices]
```

## 3. Key Differences

### 1. Role Definition

**Scopecraft**:
- Customizable stakeholder context via placeholders
- Project-specific role adaptation
- Examples: "AI co-founder", "AI senior engineer", "AI architect"

**SPARC**:
- Fixed professional identities
- One-sentence role statements
- Examples: "You are an expert programmer", "You are an AI orchestrator"

### 2. Tool Configuration

**Scopecraft**:
- Comprehensive tool list in YAML frontmatter
- Same tools across most modes
- Project-specific MCP tools as placeholders

**SPARC**:
- Tool groups mapped to roles
- Specialized tool sets per mode
- Batch operation emphasis

### 3. Coordination Approach

**Scopecraft**:
- Task metadata drives mode selection
- Extensive routing protocol in autonomous mode
- Area boundaries and scope enforcement

**SPARC**:
- Memory namespace for coordination
- TodoWrite/Task for multi-agent orchestration
- Instance isolation with unique IDs

## 4. Mode Categories Comparison

### Scopecraft Modes (6 categories)

1. **Orchestration**
   - `autonomous.md`: Task router with mode selection logic
   - `base.md`: General orchestration template

2. **Planning**
   - `base.md`: Feature breakdown with patterns (A-D)
   - Extensive task generation examples

3. **Exploration**
   - `base.md`: Research and discovery focus
   - Broad → Focused approach

4. **Design**
   - `base.md`: Technical design with trade-offs
   - Constraint-first thinking

5. **Implementation**
   - `base.md`: Building with quality principles
   - KISS, YAGNI, DRY guidelines

6. **Meta**
   - Mode management and updates

### SPARC Modes (17 specialized)

**Orchestration Group**:
- orchestrator, swarm-coordinator, workflow-manager, batch-executor

**Development Group**:
- coder, architect, designer, tdd, tester

**Research Group**:
- researcher, analyzer, innovator

**Quality Group**:
- reviewer, debugger, optimizer

**Documentation Group**:
- documenter, memory-manager

## 5. Unique Features

### Scopecraft Strengths

1. **Extensive Placeholders**
   ```markdown
   <!-- PLACEHOLDER: Define stakeholder context -->
   <!-- Example: As an AI co-founder with equity in this project's success... -->
   <!-- Consider: What experiences and background shape your approach? -->
   ```

2. **Task Pattern System**
   - Pattern 0: Too vague - brainstorming
   - Pattern A: Simple implementation
   - Pattern B: Standard feature
   - Pattern C: Exploratory development
   - Pattern D: Complex initiative

3. **Area Boundaries**
   - Strict scope enforcement
   - File modification restrictions
   - Violation protocols

4. **Orchestration Diagrams**
   - ASCII flow diagrams required
   - Phase gates and decision points
   - Visual execution planning

### SPARC Strengths

1. **Memory Integration**
   ```bash
   npx claude-flow memory store ${namespace}_progress "Status"
   npx claude-flow memory query ${namespace}
   ```

2. **Batch Operations**
   - Parallel file operations
   - Tool group optimization
   - Resource efficiency

3. **Workflow Context**
   - Step tracking
   - TDD phase awareness
   - Progress persistence

4. **Instance Isolation**
   - Unique IDs per execution
   - Parallel execution safety
   - Clear tracking

## 6. Prompt Engineering Patterns

### Scopecraft Patterns

1. **Temporal Awareness**
   - Consistent reminder to use `date` command
   - Log timestamp requirements
   - Progress tracking emphasis

2. **Quality Principles**
   - Embedded best practices (KISS, YAGNI, DRY)
   - TypeScript quality rules
   - Decision frameworks

3. **External Tool Requirements**
   - WebSearch for current information
   - Training data limitations acknowledged
   - Project-specific tool placeholders

4. **Completion Standards**
   - Detailed completion protocols
   - Quality checklists
   - Status update requirements

### SPARC Patterns

1. **Role Clarity**
   - "You are..." pattern
   - Single-sentence definitions
   - Action-oriented descriptions

2. **Tool-Task Alignment**
   - Role-specific tool configurations
   - Batch optimization emphasis
   - Memory as communication bus

3. **Best Practices Embedding**
   - 500-line file limit
   - No hardcoded secrets
   - Memory usage patterns

4. **Dynamic Context**
   - Workflow step injection
   - Namespace isolation
   - Cross-mode communication

## 7. Implementation Differences

### Task Creation

**Scopecraft**:
```yaml
# Uses MCP tools directly
mcp__scopecraft__task_create
mcp__scopecraft__parent_create
```

**SPARC**:
```javascript
// Uses TodoWrite for coordination
TodoWrite([{
  id: "task_id",
  content: "Task description",
  mode: "coder",
  batchOptimized: true
}]);
```

### Status Management

**Scopecraft**:
- Task metadata (todo → in_progress → done)
- Explicit status update requirements
- Blocked status with reasons

**SPARC**:
- Memory-based progress tracking
- Implicit through memory updates
- Focus on continuous progress

## 8. Gaps and Opportunities

### What Scopecraft Could Learn from SPARC

1. **Memory-First Coordination**
   - Add memory query capabilities to session storage
   - Enable cross-task knowledge sharing
   - Build namespace-based isolation

2. **Batch Operation Emphasis**
   - Group file operations in templates
   - Optimize for parallel execution
   - Reduce tool call overhead

3. **Specialized Tool Configurations**
   - Create role-specific tool sets
   - Remove unnecessary tools per mode
   - Optimize for task type

4. **Simplified Role Definitions**
   - Consider fixed role statements
   - Reduce customization complexity
   - Standardize agent identities

### What SPARC Could Learn from Scopecraft

1. **Rich Template Customization**
   - Add placeholder system
   - Enable project-specific adaptation
   - Provide more examples

2. **Task Pattern System**
   - Structured complexity assessment
   - Pattern-based task generation
   - Clear escalation paths

3. **Area Boundaries**
   - File scope restrictions
   - Security through limitation
   - Clear violation protocols

4. **Visual Orchestration**
   - ASCII diagrams for planning
   - Phase gates visualization
   - Dependency tracking

## 9. Integration Possibilities

### Hybrid Approach

1. **Scopecraft Base + SPARC Specialization**
   - Use Scopecraft's rich templates as foundation
   - Add SPARC's specialized modes on top
   - Maintain customization with standardization

2. **Memory-Enhanced Task System**
   - Add memory queries to Scopecraft's session storage
   - Enable SPARC-style coordination
   - Maintain file-based simplicity

3. **Tool Configuration Profiles**
   - Create SPARC-inspired tool groups
   - Apply to Scopecraft's mode system
   - Optimize based on task metadata

4. **Unified Prompt Patterns**
   - Combine temporal awareness with role clarity
   - Merge quality principles with best practices
   - Create comprehensive mode templates

## 10. Recommendations

### For Scopecraft Enhancement

1. **Add Memory Query Layer**
   ```typescript
   interface SessionMemory {
     store(key: string, value: any): Promise<void>
     query(pattern: string): Promise<any[]>
     namespace(ns: string): SessionMemory
   }
   ```

2. **Create Specialized Modes**
   - researcher.md: WebSearch-focused
   - coder.md: Implementation-optimized
   - reviewer.md: Quality-focused

3. **Implement Batch Operations**
   - Group related file operations
   - Add parallel execution hints
   - Optimize tool usage

4. **Simplify Role Definitions**
   - Provide standard role templates
   - Reduce placeholder complexity
   - Maintain customization options

### Implementation Priority

1. **High Priority**
   - Memory query capabilities
   - Batch operation templates
   - Specialized tool configurations

2. **Medium Priority**
   - Additional mode templates
   - Role standardization
   - Cross-mode communication

3. **Low Priority**
   - Full SPARC mode adoption
   - Instance isolation system
   - Workflow tracking integration

## Conclusion

Scopecraft and SPARC represent different philosophies in AI agent specialization:

- **Scopecraft**: Rich, customizable templates with strong task management integration
- **SPARC**: Standardized, role-based modes with memory-first coordination

The ideal solution likely combines Scopecraft's flexibility and task integration with SPARC's specialization and coordination patterns. By adopting memory queries, batch operations, and specialized tool configurations, Scopecraft can gain SPARC's efficiency while maintaining its superior customization and task management capabilities.