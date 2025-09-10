# Claude-Code-Flow Memory Sharing Architecture

## Overview

This document details how Claude-Code-Flow implements cross-agent memory coordination, correcting earlier assumptions about MCP-based sharing.

## Key Finding: CLI Commands, Not MCP Tools

**Critical Insight**: Claude-Code-Flow's memory sharing works through **external CLI commands**, not MCP tools. Agents execute bash commands to store and retrieve shared memory.

## Architecture Components

### 1. CLI Command Interface

```bash
# Store data
npx claude-flow memory store <key> <value> [options]

# Query/retrieve data  
npx claude-flow memory query <search> [filters]
npx claude-flow memory get <key>

# Namespace operations
npx claude-flow memory namespaces
npx claude-flow memory types
npx claude-flow memory tags
```

### 2. Storage Backend System

```typescript
interface IMemoryBackend {
  initialize(): Promise<void>;
  store(entry: MemoryEntry): Promise<void>;
  retrieve(id: string): Promise<MemoryEntry | undefined>;
  query(query: MemoryQuery): Promise<MemoryEntry[]>;
  // ... other operations
}
```

**Backend Options**:
- **SQLite Backend**: `./claude-flow.db` with structured queries
- **Markdown Backend**: Individual `.md` files in `./memory/` directory
- **Hybrid Backend**: Combines both for different use cases

### 3. Memory Entry Structure

```typescript
interface MemoryEntry {
  id: string;
  key: string;
  value: any;
  namespace: string;           // Agent/mode isolation
  tags: string[];
  metadata: Record<string, any>;
  owner: string;
  accessLevel: 'private' | 'shared' | 'public';
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  expiresAt?: Date;
  version: number;
  size: number;
  compressed: boolean;
  checksum: string;
}
```

## SPARC Mode Integration

### How SPARC Agents Use Memory

In SPARC prompts, agents are instructed to execute CLI commands:

```markdown
### Memory Commands Examples
```bash
# Store your progress
npx claude-flow memory store ${namespace}_progress "Current status and findings"

# Check for previous work
npx claude-flow memory query ${namespace}

# Store phase-specific results
npx claude-flow memory store ${namespace}_design "Architecture decisions"
```
```

### Namespace Isolation Strategy

Each SPARC mode gets its own namespace:
- `coder_progress`, `coder_results`
- `architect_findings`, `architect_design`
- `tdd_tests`, `tdd_results`
- `researcher_data`, `researcher_summary`

### Cross-Mode Coordination

Agents coordinate by:
1. **Storing in their namespace**: `coder_implementation`
2. **Querying other namespaces**: `memory query architect_design`
3. **Using shared namespaces**: `project_coordination`
4. **Tagging for discovery**: `--tags "api,database,security"`

## Advanced Features

### 1. Query Capabilities

```bash
# Full-text search
npx claude-flow memory query "database design" --full-text

# Filtered queries
npx claude-flow memory query "api" --namespace coder --type design

# Temporal queries
npx claude-flow memory query --created-after "2025-06-01" --tags "architecture"

# Aggregations
npx claude-flow memory query --aggregate-by namespace
```

### 2. Export/Import System

```bash
# Export all data
npx claude-flow memory export ./backup.json --format json

# Import with conflict resolution
npx claude-flow memory import ./data.json --conflict-resolution merge
```

### 3. Intelligent Cleanup

```bash
# Automated cleanup
npx claude-flow memory cleanup --remove-older-than 30 --archive-old

# Statistics and optimization
npx claude-flow memory stats --detailed
```

## File Storage Patterns

### SQLite Backend Storage
```
./claude-flow.db
├── entries table (main data)
├── indexes table (search optimization) 
├── namespaces table (isolation)
└── metadata table (system info)
```

### Markdown Backend Storage
```
./memory/
├── namespaces/
│   ├── coder/
│   │   ├── progress.md
│   │   └── results.md
│   ├── architect/
│   │   ├── design.md
│   │   └── decisions.md
└── shared/
    ├── project_goals.md
    └── coordination.md
```

## Coordination Patterns

### 1. Producer-Consumer
```bash
# Producer (architect mode)
npx claude-flow memory store api_design "REST API with OpenAPI spec"

# Consumer (coder mode)  
npx claude-flow memory query api_design
```

### 2. Pipeline Coordination
```bash
# Phase 1: Research
npx claude-flow memory store research_findings "Market analysis complete"

# Phase 2: Design (checks for research)
npx claude-flow memory query research_findings
npx claude-flow memory store design_spec "Architecture defined"

# Phase 3: Implementation (checks for design)
npx claude-flow memory query design_spec
```

### 3. Parallel Coordination
```bash
# Multiple agents working in parallel
npx claude-flow memory store frontend_progress "UI components 60% complete"
npx claude-flow memory store backend_progress "API endpoints 80% complete"
npx claude-flow memory store testing_progress "Unit tests 40% complete"

# Coordinator checking all progress
npx claude-flow memory query --tags "progress" --aggregate-by namespace
```

## Implementation Details

### Memory Manager Configuration

```typescript
class MemoryManager {
  constructor(config: MemoryConfig) {
    this.backend = this.createBackend(config.backend);
    this.cache = new MemoryCache(config.cacheSizeMB * 1024 * 1024);
    this.indexer = new MemoryIndexer();
  }
  
  private createBackend(type: string): IMemoryBackend {
    switch (type) {
      case 'sqlite': return new SQLiteBackend('./claude-flow.db');
      case 'markdown': return new MarkdownBackend('./memory');
      case 'hybrid': return new HybridBackend(sqlite, markdown);
    }
  }
}
```

### Performance Features

1. **LRU Cache**: In-memory caching for frequently accessed entries
2. **Full-Text Indexing**: Fast search across all content
3. **Compression**: Automatic compression for large entries
4. **Batch Operations**: Efficient multi-entry operations

## Security & Access Control

### Access Levels
- **Private**: Only accessible by creating agent
- **Shared**: Accessible within the same session/workflow
- **Public**: Accessible across all sessions

### Ownership Tracking
- Each entry has an `owner` field
- Permissions enforced at CLI level
- Audit trail for modifications

## Comparison with Scopecraft Opportunities

### What Scopecraft Could Adopt

1. **CLI Memory Commands**
   ```bash
   sc memory store task_findings "Database analysis complete"
   sc memory query architecture --task-id feature-auth
   ```

2. **Session Storage Enhancement**
   - Add query capabilities to existing session storage
   - Implement namespace isolation per task/worktree
   - Enable cross-task knowledge sharing

3. **File-Based Backends**
   - Markdown backend aligns with Scopecraft's philosophy
   - Git-friendly storage for version control
   - Human-readable coordination data

4. **Template Integration**
   ```markdown
   ## Memory Integration
   Use memory commands to coordinate:
   - `sc memory store ${taskId}_progress "Current status"`
   - `sc memory query ${parentId} --type findings`
   ```

### Scopecraft-Specific Advantages

1. **Task Metadata Integration**: Memory entries could include task relationships
2. **Worktree Isolation**: Memory namespaces per git worktree
3. **Parent-Child Coordination**: Automatic memory sharing between parent and subtasks
4. **Unix Philosophy**: Keep it simple with just file-based backends

## Conclusion

Claude-Code-Flow's memory sharing is elegantly simple:
- **CLI commands** for storage/retrieval
- **File-based backends** (SQLite or Markdown)
- **Namespace isolation** for coordination
- **No running services** required

This approach aligns perfectly with Scopecraft's Unix philosophy while enabling sophisticated agent coordination. The key insight is that memory sharing doesn't require complex infrastructure - just well-designed CLI commands and file storage.