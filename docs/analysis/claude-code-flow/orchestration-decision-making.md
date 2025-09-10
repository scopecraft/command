# Claude-Code-Flow Orchestration Decision-Making Analysis

## Overview

This document provides a detailed analysis of how Claude-Code-Flow makes orchestration decisions, including mode selection, task routing, complexity assessment, and agent assignment algorithms.

## Key Finding: No Git Automation

**Important Discovery**: Claude-Code-Flow does **NOT** implement git automation, worktree orchestration, or automatic commits/merges. It focuses purely on AI agent coordination and workflow orchestration.

## 1. SPARC Mode Selection Logic

### Decision Tree for Agent-to-Phase Mapping

```
Agent Type → SPARC Phase Selection:
├── Analyzer
│   ├── If task contains "Requirements" or "Plan" → Specification Phase
│   └── Else → Analysis Phase
├── Researcher → Pseudocode Phase
├── Architect/Coordinator
│   ├── If task contains "Architecture" or "design" → Architecture Phase
│   └── Else → Coordination Phase
├── Developer
│   ├── If TDD enabled AND task contains "Implement" → TDD Phase (Red-Green-Refactor)
│   └── Else → Implementation Phase
├── Tester → Testing Phase
├── Reviewer → Review Phase
├── Documenter → Documentation Phase
└── Default → Generic Phase
```

### Key Decision Factors
- **Agent type capabilities**
- **Task name/description keywords**
- **TDD enablement flag**
- **Task complexity assessment**

## 2. Task Complexity Assessment

### Complexity Calculation Algorithm

```typescript
// Base complexity from description analysis
let complexity = this.estimateComplexity(description);

// Apply ML heuristics multipliers
for (const [factor, weight] of complexityFactors) {
  if (description.toLowerCase().includes(factor)) {
    complexity *= weight;
  }
}

// Complexity factors with weights:
{
  'integration': 1.5,
  'system': 1.3,
  'api': 1.2,
  'database': 1.4,
  'ui': 1.1,
  'algorithm': 1.6
}
```

### Complexity Impact on Orchestration

- **Complexity >= 4**: Forces development strategy
- **Complexity >= 3**: Enables parallel implementation tasks
- **Complexity >= 2**: Requires analysis and testing phases

## 3. Strategy Selection Logic

### AutoStrategy Decision Tree

```typescript
private selectOptimalStrategy(objective: SwarmObjective, complexity: number): string {
  if (complexity >= 4) return 'development';
  if (objective.description.toLowerCase().includes('analyze')) return 'analysis';
  if (objective.description.toLowerCase().includes('test')) return 'testing';
  return 'auto';
}
```

### Task Structure Determination

```typescript
private determineOptimalTaskStructure(patterns, taskTypes, complexity) {
  return {
    requiresAnalysis: complexity >= 2 || taskTypes.includes('analysis'),
    requiresImplementation: taskTypes.includes('development') || taskTypes.includes('coding'),
    requiresTesting: complexity >= 2 || taskTypes.includes('testing'),
    analysisDuration: Math.max(5 * 60 * 1000, complexity * 3 * 60 * 1000),
    testingDuration: Math.max(5 * 60 * 1000, complexity * 4 * 60 * 1000)
  };
}
```

## 4. Coordination Mode Selection

### Five Coordination Modes

1. **Centralized**: Single coordinator manages all tasks
2. **Distributed**: Peer-to-peer coordination
3. **Hierarchical**: Multi-level coordination structure
4. **Hybrid**: Combines centralized and distributed approaches
5. **Mesh**: Full connectivity between all agents

### Coordinator Selection Logic (Centralized Mode)

```python
def _select_coordinator(self, agents):
    available_agents = [a for a in agents if a.status == AgentStatus.IDLE]
    if not available_agents:
        return agents[0]  # Fallback
    
    # Select agent with highest success rate
    coordinator = max(available_agents, key=lambda a: a.success_rate)
    return coordinator
```

## 5. Agent Selection Algorithms

### ML-Inspired Agent Scoring

```typescript
private async calculateAgentScore(agent: AgentState, task: TaskDefinition): Promise<number> {
  let score = 0;

  // Capability matching (40%)
  const capabilityMatch = this.calculateCapabilityMatch(agent, task);
  score += capabilityMatch * 0.4;

  // Performance history (30%)
  const performanceScore = this.getAgentPerformanceScore(agent.id);
  score += performanceScore * 0.3;

  // Current workload (20%)
  const workloadScore = 1 - agent.workload;
  score += workloadScore * 0.2;

  // ML heuristics adjustment (10%)
  const mlScore = this.applyMLHeuristics(agent, task);
  score += mlScore * 0.1;

  return score;
}
```

### Task Assignment in Orchestrator

```typescript
private selectAgentForTask(task: Task, agents: AgentProfile[]): AgentProfile {
  const scoredAgents = agents.map(agent => {
    let score = agent.priority * 10;
    
    // Check capability match
    const requiredCapabilities = task.metadata?.requiredCapabilities || [];
    const matchedCapabilities = requiredCapabilities.filter(
      cap => agent.capabilities.includes(cap)
    ).length;
    
    if (requiredCapabilities.length > 0 && matchedCapabilities === 0) {
      return { agent, score: -1 }; // Can't handle task
    }
    
    score += matchedCapabilities * 5;
    
    // Prefer agents with matching type
    if (task.type === agent.type) {
      score += 20;
    }
    
    return { agent, score };
  });
  
  // Select highest scoring eligible agent
  const eligibleAgents = scoredAgents.filter(({ score }) => score >= 0);
  eligibleAgents.sort((a, b) => b.score - a.score);
  return eligibleAgents[0]?.agent;
}
```

## 6. Task Scheduling Algorithms

### Available Scheduling Strategies

- **ROUND_ROBIN**: Sequential assignment
- **LEAST_LOADED**: Assign to agent with lowest workload
- **CAPABILITY_BASED**: Match agent capabilities to task requirements
- **PRIORITY_BASED**: Sort by task priority
- **DYNAMIC**: Adaptive algorithm selection
- **WORK_STEALING**: Load balancing through task redistribution

### Dynamic Scheduling Decision

```python
def schedule_tasks(self, tasks, agents):
    if self.algorithm == SchedulingAlgorithm.DYNAMIC:
        assignments = self._schedule_dynamic(sorted_tasks, available_agents)
    # ... other algorithms
```

## 7. Dependency and Sequencing Logic

### Dependency Analysis

```typescript
private analyzeDependencies(tasks: TaskDefinition[]): Map<string, string[]> {
  const dependencies = new Map<string, string[]>();
  
  tasks.forEach(task => {
    if (task.constraints.dependencies.length > 0) {
      dependencies.set(task.id.id, task.constraints.dependencies.map(dep => dep.id));
    }
  });
  
  return dependencies;
}
```

### Task Batching for Parallel Execution

```typescript
private createTaskBatches(tasks: TaskDefinition[], dependencies: Map<string, string[]>): TaskBatch[] {
  const batches: TaskBatch[] = [];
  const processed = new Set<string>();
  let batchIndex = 0;

  while (processed.size < tasks.length) {
    const batchTasks = tasks.filter(task => 
      !processed.has(task.id.id) && 
      task.constraints.dependencies.every(dep => processed.has(dep.id))
    );

    if (batchTasks.length === 0) break; // Prevent infinite loop

    const batch: TaskBatch = {
      id: `batch-${batchIndex++}`,
      tasks: batchTasks,
      canRunInParallel: batchTasks.length > 1,
      estimatedDuration: Math.max(...batchTasks.map(t => t.constraints.timeoutAfter || 0)),
      requiredResources: this.calculateBatchResources(batchTasks)
    };

    batches.push(batch);
    batchTasks.forEach(task => processed.add(task.id.id));
  }

  return batches;
}
```

## 8. Orchestrator Decision-Making Flow

### High-Level Decision Process

1. **Task Validation**: Check task structure and requirements
2. **Agent Pool Assessment**: Evaluate available agents
3. **Strategy Selection**: Choose execution strategy based on task type/complexity
4. **Mode Selection**: Determine coordination mode
5. **Agent Assignment**: Score and select optimal agents
6. **Batch Creation**: Group tasks for parallel execution
7. **Dependency Resolution**: Ensure proper execution order
8. **Resource Allocation**: Assign computational resources
9. **Monitoring**: Track progress and adjust as needed

### Circuit Breaker Integration

```typescript
await this.taskAssignmentCircuitBreaker.execute(async () => {
  // Task assignment logic with fault tolerance
});
```

## 9. Git Workflow Integration (Limited)

### What Claude-Code-Flow Does NOT Do

- ❌ No automatic git commits or merges
- ❌ No worktree creation or management
- ❌ No branch automation
- ❌ No pull request creation
- ❌ No merge conflict resolution

### What It Does Provide

- ✅ CI/CD integration points
- ✅ Webhook support for git platforms
- ✅ Status updates to git repositories
- ✅ Project structure generation (with .gitignore)

### Integration Example

```bash
# CI/CD integration (manual setup)
swarm-benchmark run "${{ github.event.head_commit.message }}" \
  --name "ci-${{ github.run_id }}" \
  --tags ci,automated
```

## 10. Decision-Making Insights

### Key Patterns

1. **Multi-layered Decision Making**: Multiple decision layers (strategy, mode, agent, scheduling) work together
2. **ML-Inspired Heuristics**: Weighted scoring systems and performance history for intelligent decisions
3. **Adaptive Behavior**: Decisions change based on system state, load, and historical performance
4. **Fault Tolerance**: Circuit breakers and fallback mechanisms ensure robust operation
5. **Complexity-Driven**: Task complexity is a primary driver for orchestration decisions
6. **Agent Specialization**: Strong emphasis on matching agent capabilities to task requirements

### Performance Considerations

- **Agent Scoring**: 40% capability match, 30% performance history, 20% workload, 10% ML heuristics
- **Complexity Factors**: Integration (1.5x), Algorithm (1.6x), Database (1.4x), System (1.3x)
- **Scheduling**: Dynamic algorithm selection based on current system state
- **Batching**: Parallel execution groups based on dependency analysis

## Implications for Scopecraft

### What Scopecraft Could Learn

1. **Complexity Assessment**: Automated task complexity scoring based on keywords and patterns
2. **Agent Scoring**: Weighted scoring for task-agent matching
3. **Adaptive Scheduling**: Dynamic algorithm selection based on system state
4. **Dependency Batching**: Intelligent grouping for parallel execution
5. **Circuit Breaker Patterns**: Fault tolerance in orchestration decisions

### Scopecraft's Advantages

1. **Git Integration**: Scopecraft's worktree management is more sophisticated
2. **File-Based Approach**: Simpler, more transparent decision tracking
3. **Human-Centric**: Better human oversight and intervention capabilities
4. **Unix Philosophy**: Simpler, composable decision-making patterns

### Implementation Opportunities

1. **Task Complexity Scoring**: Add automated complexity assessment to Scopecraft tasks
2. **Mode Selection Logic**: Implement decision trees for template/mode selection
3. **Dependency Analysis**: Enhance parent-child task relationship handling
4. **Performance Tracking**: Add agent/session performance history for better routing

## Conclusion

Claude-Code-Flow demonstrates sophisticated decision-making algorithms for AI agent orchestration, but deliberately avoids git automation. Its strength lies in intelligent task distribution and agent coordination, while leaving version control operations to external tools. This design philosophy emphasizes the separation of concerns between AI orchestration and git workflow management.