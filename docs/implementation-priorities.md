# Implementation Priorities & Quick Wins

## This Week's Focus: Mode System MVP

### 1. Hardcoded Implement Mode (Day 1-2)
**Goal**: Get a working mode TODAY that speeds up our development

```bash
# Simple command that just works
sc mode implement TASK-001
```

**Implementation**:
- Single file: `scripts/modes/implement.ts`
- Hardcode our project's test commands
- Use our existing prompts as templates
- Save output to task automatically

**Why First**: Immediate productivity boost, proves the concept

### 2. Mode Badge in Task UI (Day 2)
**Goal**: Visual indicator showing current mode

**Implementation**:
- Add mode field to task metadata
- Color-coded pills: 🔵 Implement, 🟣 Design, 🟢 Plan
- Show in task list and detail views
- Update via MCP when mode starts

**Why First**: Visual differentiation, easy win, demos well

### 3. Basic Parallel Runner (Day 3-4)
**Goal**: Run 2-3 tasks simultaneously in tmux

```bash
# Start parallel exploration
sc parallel explore TASK-001 TASK-002
```

**Implementation**:
- Use existing tmux integration
- Simple process manager
- Shared context via `.claude-context/`
- Basic status dashboard

**Why First**: Major speed improvement, impressive demo

### 4. Question Queue (Day 4-5)
**Goal**: Handle questions from parallel modes

**Implementation**:
- Write questions to `.claude-questions/TASK-XXX.json`
- Simple CLI to review and answer
- Resume mode with answers
- Visual indicator in UI

**Why First**: Enables true autonomous work

## Demos That Sell

### The 30-Second Wow
```bash
# One command
sc analyze ./new-project

# Generates:
- Complete task breakdown
- Complexity analysis  
- Suggested tech stack
- "Start coding" button

# Click button → Opens 3 tmux panes working in parallel
```

### The Studio Pitch
"Drop any client project in, get a full breakdown in 30 seconds. Your team starts working immediately with AI assistance. Clients see real-time progress."

### The Developer Pitch
"It's like having 3 senior devs working in parallel, but they never forget context and always follow your patterns."

## Hardcoded → Generic Evolution

### Start Specific (Week 1)
```typescript
// modes/implement.ts
const TEST_COMMAND = "bun test";
const LINT_COMMAND = "bun run check";
const PROJECT_PATTERNS = {
  api: "src/mcp/handlers.ts",
  ui: "tasks-ui/src/components"
};
```

### Add Configuration (Week 2)
```typescript
// .scopecraft/config.yaml
modes:
  implement:
    commands:
      test: "bun test"
      lint: "bun run check"
    patterns:
      api: "src/mcp/handlers.ts"
```

### Full Customization (Week 3)
```typescript
// .scopecraft/modes/custom-implement.md
Custom prompt with project-specific instructions...
```

## Parallel Execution Architecture

### Simple Start
```
Terminal
├── Pane 1: sc mode explore TASK-001
├── Pane 2: sc mode explore TASK-002  
└── Pane 3: sc status (shows queue)
```

### Context Sharing
```
.claude-context/
├── session-001/
│   ├── findings.json
│   └── questions.json
├── session-002/
│   ├── findings.json
│   └── questions.json
└── shared/
    └── context.json
```

### Orchestration
```typescript
// Simple orchestrator
class ParallelRunner {
  async run(tasks: string[], mode: string) {
    // 1. Create tmux windows
    // 2. Start each mode with task
    // 3. Monitor for questions
    // 4. Collect results
    // 5. Suggest next steps
  }
}
```

## Marketing While Building

### Daily Updates Format
```
🚀 Scopecraft Day X

Today: Parallel mode execution

Before: Run tasks one by one
After: 3 tasks simultaneously

[30 second video]

The productivity gain is insane.

GitHub: [link]
```

### Weekly Demo Videos
- Week 1: "Watch AI code 3 features at once"
- Week 2: "From repo to tasks in 30 seconds"
- Week 3: "Custom modes for any workflow"
- Week 4: "Studio case study: 5x faster delivery"

## Success Criteria This Month

### For Us (Dogfooding)
- [ ] Cut feature development time in half
- [ ] Never lose context between sessions
- [ ] Run 3+ tasks in parallel daily

### For Studio
- [ ] Onboard first project
- [ ] Create 3 client-specific templates
- [ ] Get "wow" reaction from team

### For Community  
- [ ] 100 GitHub stars
- [ ] 10 people try it
- [ ] 1 contributor PR

## The Pitch Evolution

### Week 1: "AI pair programming that actually works"
### Week 2: "Develop 3x faster with parallel AI"
### Week 3: "From any codebase to working in 30 seconds"
### Week 4: "How we 5x'd our studio's delivery speed"

## Next Hour Action

1. Create `scripts/modes/implement.ts`
2. Hardcode everything for our project
3. Run it on a real task
4. Tweet the result

Speed wins. Polish later.