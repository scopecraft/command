# Scopecraft Orchestration & Automation Vision

## Overview

This document outlines the long-term vision for Scopecraft's orchestration and automation capabilities, building upon the Phase 1 foundation of Docker-enabled session management.

## Core Philosophy

### 1. AI-Native Development Workflow
Scopecraft represents a paradigm shift from traditional development tools to an AI-native workflow where:
- **Tasks are the primary unit of work**, not code files or tickets
- **AI agents are first-class citizens**, not just assistants
- **Automation is the default**, manual intervention is the exception
- **Context is preserved and propagated** across all interactions

### 2. Progressive Autonomy
The system should support a spectrum of autonomy levels:
- **Guided**: Human drives, AI assists (current state)
- **Collaborative**: Human and AI work together in real-time
- **Supervised**: AI works autonomously with human checkpoints
- **Autonomous**: AI completes tasks independently (target state)

## Architectural Principles

### 1. Docker-First Execution
All AI operations run in containerized environments because:
- **Safety**: Isolates potentially dangerous operations
- **Reproducibility**: Consistent environment across all executions
- **Permissions**: Enables full filesystem and git access
- **Scalability**: Easy to distribute across machines

### 2. Session Unification
A single session abstraction that supports:
- **Multiple modes**: Autonomous, interactive, dispatch (parallel tmux), planning, orchestration
- **Multiple environments**: Docker containers, TMux sessions, worktrees
- **Multiple interfaces**: CLI, MCP, UI, API
- **Multiple contexts**: Tasks, features, projects

### 3. Hybrid Storage Architecture
Separate runtime state from historical data:
- **Runtime State** (`~/.scopecraft/`): Active sessions, queues, monitoring
- **Historical State** (`.tasks/` in git): Completed sessions, decisions, artifacts
- **Worktree Awareness**: Tasks exist per-branch, sessions know their context

This separation enables:
- Clean dashboard implementation (single source for runtime)
- Git-based collaboration (shareable history)
- Multi-developer evolution (clear boundaries)

### 4. Worktree-First Execution
Every session must execute in the appropriate git worktree:
- **Task-Worktree Binding**: Sessions for a task run in that task's branch worktree
- **Automatic Resolution**: System finds or creates the right worktree before execution
- **No Main Branch Execution**: Prevents accidental changes to main branch
- **Convention-Based**: `feature/auth-05A` branch owns tasks ending in `-05A`

This ensures:
- Proper branch isolation for all changes
- Parallel development without conflicts
- Clear ownership of task implementations

### 5. Event-Driven Architecture
Everything is an event:
- **Session lifecycle**: Created, started, completed, failed
- **Task progress**: Status changes, log entries, costs
- **System health**: Queue depth, resource usage, errors
- **Human interactions**: Feedback, approvals, corrections

## Implementation Roadmap

### Phase 2: Multi-Interface Support (Weeks 3-4)
**Goal**: Enable orchestration through CLI, MCP, and UI

Including support for:
- Autonomous sessions (Docker-based background execution)
- Dispatch sessions (TMux-based parallel interactive)
- Unified interface across all modes

#### Unified CLI Commands
```bash
# New unified CLI commands
scopecraft session start <taskId> [options]
  --mode autonomous|dispatch|interactive|planning|orchestration
  --worktree <branch>     # Create/use git worktree
  --dangerous             # Enable dangerous operations
  --priority high|normal  # Queue priority
  --parent <parentId>     # Parent task context

scopecraft session list [--active|--queued|--all]
scopecraft session logs <sessionId> [--follow]
scopecraft session cancel <sessionId>
scopecraft session continue <sessionId> "feedback"
scopecraft session attach <sessionId>  # For dispatch/interactive sessions
```

#### MCP Integration
```typescript
// New MCP methods
session_create(params: SessionCreateParams) -> UnifiedSession
session_list(filter?: SessionFilter) -> UnifiedSession[]
session_get(sessionId: string) -> UnifiedSession
session_cancel(sessionId: string) -> boolean
session_continue(sessionId: string, feedback: string) -> boolean
session_logs(sessionId: string, limit?: number) -> LogEntry[]
```

### Phase 3: Additional Session Types (Weeks 5-6)
**Goal**: Implement remaining executors

#### Interactive Sessions (TMux)
```typescript
class InteractiveExecutor extends BaseExecutor {
  async create(options: CreateSessionOptions) {
    const sessionName = `claude-${options.taskId}-${Date.now()}`;
    
    // Create TMux session
    await exec(`tmux new-session -d -s ${sessionName}`);
    
    // Start Claude in TMux (no Docker for interactive)
    const command = this.buildInteractiveCommand(options);
    await exec(`tmux send-keys -t ${sessionName} "${command}" Enter`);
    
    return this.createSessionRecord(sessionName, options);
  }
}
```

#### Planning & Orchestration Modes
- **Planning**: One-off Docker runs with specialized prompts
- **Orchestration**: Meta-sessions that can spawn child sessions

### Phase 4: Advanced Queue & Resource Management (Weeks 7-8)
**Goal**: Production-grade queue with advanced features

#### Priority Queue Implementation
```typescript
interface QueuePolicy {
  maxConcurrent: Record<SessionMode, number>;
  maxQueueSize: number;
  priorityWeights: Record<Priority, number>;
  fairnessPolicy: 'fifo' | 'round-robin' | 'weighted';
}

class PriorityQueue extends SimpleQueue {
  async enqueue(item: QueueItem): Promise<QueuedSession> {
    // Add to appropriate priority lane
    const lane = this.lanes.get(item.priority);
    lane.push(item);
    
    // Process based on policy
    return this.processWithPolicy();
  }
}
```

#### Resource Management
- CPU and memory limits per session type
- Cost budgets with automatic pausing
- Concurrent session limits by area/team
- Resource reservation for critical tasks

### Phase 5: Worktree Lifecycle Management (Weeks 9-10)
**Goal**: Seamless git worktree integration

```typescript
class WorktreeOrchestrator {
  async executeInWorktree(session: UnifiedSession) {
    // Create or reuse worktree
    const worktreePath = await this.prepareWorktree(session);
    
    // Execute session in worktree context
    const result = await this.executeSession(session, worktreePath);
    
    // Cleanup based on policy
    if (this.shouldCleanup(session)) {
      await this.cleanupWorktree(worktreePath);
    }
    
    return result;
  }
}
```

## Cloud Execution Strategy

Leverage existing CI/PR infrastructure for cloud execution without additional infrastructure:

### CI-Based Autonomous Sessions
```yaml
# Triggered by PR comment: @scopecraft implement feature-xyz
name: Scopecraft Cloud Session
on:
  issue_comment:
    types: [created]

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    container: my-claude:authenticated
    steps:
      - uses: actions/checkout@v4
      - name: Run Scopecraft Session
        run: |
          scopecraft session start ${{ env.TASK_ID }} \
            --mode autonomous \
            --environment CI
```

### Storage Adapter Pattern
```typescript
interface StorageAdapter {
  saveSession(session: Session): Promise<void>
  getSession(id: string): Promise<Session>
  listSessions(): Promise<Session[]>
  updateStatus(id: string, status: SessionStatus): Promise<void>
}

// Implementations
class LocalStorageAdapter {
  // Stores in ~/.scopecraft/
  constructor(private basePath = '~/.scopecraft') {}
}

class CIStorageAdapter {
  // Stores as PR comments and artifacts
  constructor(private github: GitHubClient) {}
  
  async updateStatus(id: string, status: SessionStatus) {
    await this.github.createComment({
      body: `🤖 Session ${id}: ${status}\n${new Date().toISOString()}`
    });
  }
}

// Automatic selection based on environment
const adapter = process.env.CI 
  ? new CIStorageAdapter(github) 
  : new LocalStorageAdapter();
```

This approach provides:
- **Zero Infrastructure**: Uses existing CI/PR systems
- **Natural Audit Trail**: All updates in PR history
- **Access Control**: Leverages GitHub permissions
- **Cost Efficiency**: Pay only for CI minutes

## Long-Term Capabilities

### 1. Intelligent Orchestration (6-12 months)

#### Self-Organizing Task Execution
```typescript
// Future: AI determines optimal execution strategy
orchestrator.plan({
  goal: "Implement authentication system",
  constraints: {
    deadline: "2024-02-01",
    budget: 50.00,
    quality: "production"
  }
});
// AI breaks down into tasks, determines dependencies,
// schedules parallel execution, monitors progress
```

#### Adaptive Prompt Engineering
- Dynamic prompt selection based on task context
- Learning from successful completions
- A/B testing of prompt variations
- Automatic prompt optimization

### 2. Multi-Agent Collaboration (12-18 months)

#### Specialized Agent Roles
```typescript
enum AgentRole {
  ARCHITECT = 'architect',      // High-level design
  IMPLEMENTER = 'implementer',  // Code writing
  REVIEWER = 'reviewer',        // Code review
  TESTER = 'tester',           // Test creation
  DOCUMENTER = 'documenter'    // Documentation
}

// Agents collaborate on complex features
orchestrator.deployTeam({
  feature: "payment-processing",
  agents: [
    { role: AgentRole.ARCHITECT, model: 'opus' },
    { role: AgentRole.IMPLEMENTER, model: 'sonnet', count: 2 },
    { role: AgentRole.TESTER, model: 'haiku' }
  ]
});
```

#### Inter-Agent Communication Protocol
- Structured message passing between agents
- Shared context and memory systems
- Conflict resolution mechanisms
- Human escalation protocols

### 3. Continuous Learning System (18-24 months)

#### Pattern Recognition & Optimization
- Identify successful task completion patterns
- Learn from failures and adapt strategies
- Optimize resource usage based on history
- Predict task complexity and duration

#### Knowledge Graph Construction
```typescript
// Future: AI maintains living knowledge graph
interface KnowledgeNode {
  type: 'concept' | 'implementation' | 'decision' | 'pattern';
  content: string;
  relationships: Edge[];
  confidence: number;
  lastUpdated: Date;
}

// Query the knowledge graph
const knowledge = await kb.query({
  question: "How do we handle authentication?",
  context: "microservices architecture"
});
```

### 4. Full Lifecycle Automation (24+ months)

#### Autonomous Feature Development
```
User: "We need a way for users to export their data"

System Pipeline:
1. Requirements Analysis
   - Generates user stories
   - Defines acceptance criteria
   - Estimates complexity

2. Technical Design
   - Creates architecture diagram
   - Identifies dependencies
   - Plans implementation phases

3. Implementation
   - Spawns specialized agents
   - Implements in parallel worktrees
   - Writes comprehensive tests

4. Quality Assurance
   - Runs test suites
   - Performs security analysis
   - Checks performance metrics

5. Deployment
   - Creates pull request
   - Handles review feedback
   - Monitors staging deployment
   - Promotes to production
```

## Advanced Features

### 1. Distributed Orchestration
```typescript
interface ClusterConfig {
  nodes: Array<{
    endpoint: string;
    capacity: ResourceLimits;
    specialization?: AgentRole[];
  }>;
  scheduler: 'round-robin' | 'least-loaded' | 'specialized';
}

// Distribute sessions across multiple machines
const cluster = new OrchestrationCluster(clusterConfig);
await cluster.executeDistributed(sessions);
```

### 2. Failure Recovery & Resilience
- Automatic retry with exponential backoff
- Session state persistence and recovery
- Partial failure handling
- Rollback capabilities

### 3. Cost Optimization Engine
```typescript
interface CostOptimizer {
  // Analyze historical data
  analyzeCosts(period: DateRange): CostAnalysis;
  
  // Suggest optimizations
  suggestOptimizations(): Optimization[];
  
  // Automatic cost controls
  enforeceBudget(budget: Budget): void;
}
```

### 4. Integration Ecosystem

#### Development Tool Integrations
- **IDE Plugins**: Real-time AI assistance in VS Code/Cursor
- **Git Providers**: Automated PR creation and management
- **CI/CD Systems**: Pipeline triggers and monitoring
- **Issue Trackers**: Bidirectional sync with Jira/Linear

#### Communication Integrations
- **Slack/Discord Bots**: Status updates and control
- **Email Notifications**: Summary reports and alerts
- **Webhooks**: Custom integrations
- **APIs**: RESTful and GraphQL endpoints

## Governance & Safety

### 1. Approval Workflows
```typescript
interface ApprovalPolicy {
  // Cost-based approvals
  costThreshold: {
    automatic: number;      // No approval needed
    supervised: number;     // Requires approval
    forbidden: number;      // Never exceed
  };
  
  // Operation-based approvals
  operations: {
    production: 'never' | 'always' | 'conditional';
    dataModification: 'never' | 'always' | 'conditional';
    externalAPIs: 'never' | 'always' | 'conditional';
  };
  
  // Review requirements
  codeReview: {
    required: boolean;
    autoMergeIfPassing: boolean;
    reviewers: string[];
  };
}
```

### 2. Comprehensive Audit System
- Immutable audit log of all operations
- Cost attribution by task/feature/team/user
- Compliance reporting (SOC2, GDPR)
- Forensic analysis capabilities

### 3. Safety Mechanisms
- Sandboxed execution environments
- Rate limiting at multiple levels
- Circuit breakers for external services
- Automatic rollback on failures
- Human intervention triggers

## Success Metrics

### Near-term (3-6 months)
- 80% of simple tasks completed autonomously
- 50% reduction in development cycle time
- 90% first-time success rate for autonomous tasks
- <$0.50 average cost per task
- 100% Docker adoption for autonomous sessions

### Mid-term (6-12 months)
- Complex features implemented end-to-end
- Multi-agent collaboration on 30% of tasks
- Self-healing from common failures
- Proactive optimization suggestions
- 5x developer productivity improvement

### Long-term (12-24 months)
- Full SDLC automation for standard features
- 10x developer productivity improvement
- <5% human intervention required
- Industry-leading AI development platform
- $1M+ in development cost savings

## Technical Challenges & Solutions

### 1. State Management at Scale
- **Challenge**: Managing thousands of concurrent sessions
- **Solution**: Distributed state store with event sourcing

### 2. Context Window Limitations
- **Challenge**: AI context windows are limited
- **Solution**: Intelligent context compression and chunking

### 3. Non-Deterministic Behavior
- **Challenge**: AI responses can vary
- **Solution**: Structured outputs, validation, and retry logic

### 4. Security & Compliance
- **Challenge**: AI with production access
- **Solution**: Zero-trust architecture, comprehensive auditing

### 5. Multi-Worktree Task State
- **Challenge**: Tasks diverge across branches/worktrees
- **Solution**: Worktree-aware task service with smart detection
  - Convention-based: `feature/auth-05A` branch → owns `*-auth-05A` tasks
  - Session context: Active sessions know their worktree
  - Explicit override: Can query specific worktrees
  - Dashboard aggregates runtime state (sessions) with task state (per-worktree)

This enables holistic view of work across all active branches while maintaining git's branch isolation benefits.

## Conclusion

Scopecraft's orchestration and automation vision represents a fundamental shift in software development. By combining Docker-isolated execution, unified session management, and progressive automation, we're building a platform where AI agents become true development partners.

The journey from Phase 1's Docker-enabled sessions to full autonomous development will be incremental but transformative. Each phase builds on the previous, maintaining backward compatibility while pushing the boundaries of what's possible.

The key to success is starting with a solid foundation (Phase 1), then progressively adding capabilities based on real-world usage and feedback. By maintaining flexibility in our architecture while staying true to our core principles, Scopecraft will evolve into the definitive platform for AI-native software development.