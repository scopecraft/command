# Research storage patterns and implications

---
type: spike
status: in_progress
area: core
---


## Instruction
Research and document the implications of migrating task storage to ~/.scopecraft/projects/.

Key areas to investigate:
1. **Path encoding scheme**: How Claude encodes directory paths (analyze examples)
2. **Permission handling**: What happens when agents need to access files outside project root
3. **Docker volume mounting**: Best practices for mounting ~/.scopecraft into containers
4. **Cross-platform considerations**: Windows/Mac/Linux path differences
5. **Backup/sync implications**: How this affects user backup strategies

Examine Claude's implementation in ~/.claude/projects/ as reference.

## Tasks
- [x] Analyze Claude's path encoding scheme (e.g., /Users/name/Projects/foo → -Users-name-Projects-foo)
- [x] Document permission implications for AI agents
- [x] Research Docker volume mounting best practices for home directories
- [x] Identify cross-platform path handling requirements
- [x] Consider backup/sync tool compatibility (Time Machine, Dropbox, etc.)
- [x] Document security considerations

## Deliverable
# Technical Analysis: Task Storage Migration to ~/.scopecraft/projects/

## Log
- 2025-06-10: 2025-06-10 16:53: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_resr-stor-patt-implctns-06L
  - Analysis: type:spike, research-focused, area:core
  - Selected Mode: Exploration (inferred from spike type + research keywords)
  - Reasoning: Task requires investigation and documentation of storage patterns
  - Beginning research on Claude's ~/.claude/projects/ implementation
- 2025-06-10: 2025-06-10 16:56: ✓ Path encoding scheme analyzed
  - Claude uses simple pattern: '/' → '-', prefix with '-'
  - Example: /Users/name/Projects/foo → -Users-name-Projects-foo
  - Supports complex paths including git worktrees with branches
  - Next: Research Docker volume mounting patterns
- 2025-06-10: 2025-06-10 17:02: ✓ Completed research on all key areas
  - Docker security patterns and volume mounting best practices
  - Cross-platform path differences (Windows vs macOS vs Linux)
  - Backup/sync tool compatibility (Time Machine, Dropbox)
  - Security implications for sensitive config data
  - Now compiling technical analysis document
- 2025-06-10: 2025-06-10 17:05: === EXECUTION COMPLETE ===
  - Mode Used: Exploration
  - Status: COMPLETED
  - Deliverable: READY
  - All research areas completed and synthesized into comprehensive technical analysis
  - Key findings: Claude's path encoding, Docker security strategies, cross-platform approaches, backup/security implications
  - Ready for implementation planning

## Executive summary
Migrating task storage to `~/.scopecraft/projects/` follows Claude's proven pattern but introduces specific considerations around security, cross-platform compatibility, and integration with backup/sync systems.

## 1. path encoding algorithm
### Claude's Implementation Analysis

Based on analysis of `~/.claude/projects/`, Claude uses a simple but effective encoding scheme:

**Pattern**: Replace all forward slashes (`/`) with hyphens (`-`) and prefix with `-`

**Examples**:
- `/Users/name/Projects/foo` → `-Users-name-Projects-foo`
- `/Users/name/Projects/scopecraft-v2.worktrees/migr-task-stor-scpcrft-06A` → `-Users-name-Projects-scopecraft-v2-worktrees-migr-task-stor-scpcrft-06A`

**Advantages**:
- Predictable and reversible encoding
- Handles complex paths including git worktrees with branches
- Avoids filesystem conflicts across platforms
- Simple to implement and debug

**Recommendation**: Adopt Claude's exact encoding scheme for compatibility and proven reliability.

## 2. permission model recommendations
### Current Challenge
AI agents currently require broad filesystem access to read/write task files across project directories.

### Proposed Model
1. **Centralized Storage**: Tasks stored in `~/.scopecraft/projects/{encoded-path}/`
2. **Controlled Access**: Agents only need read/write access to `~/.scopecraft/`
3. **Project Linking**: Symbolic links or configuration files point projects to their task storage
4. **Sandboxing Compatible**: Works with Docker and other containerization

### Benefits
- Reduces permission scope for AI agents
- Enables easier backup/restore operations
- Supports project-level access controls
- Compatible with corporate security policies

## 3. docker mounting strategy
### Security Considerations
Docker volume mounting of home directories carries significant security risks:
- **Root Privilege Escalation**: Containers with mounted `/` can modify any host file
- **Sensitive Data Exposure**: Home directories contain SSH keys, credentials, etc.
- **Persistence Attacks**: Malicious containers can modify host system

### Recommended Docker Strategy

#### Option A: Selective Mounting (Recommended)
```dockerfile
# Mount only scopecraft directory
volumes:
  - ~/.scopecraft:/home/user/.scopecraft:rw
  - ./project:/workspace:ro  # Project files read-only
```

#### Option B: Dedicated User and Limited Permissions
```dockerfile
# Create non-root user with limited permissions
RUN useradd -m -s /bin/bash scopecraft
USER scopecraft

# Mount with read-only where possible
volumes:
  - ~/.scopecraft:/home/scopecraft/.scopecraft:rw
  - ~/.config/scopecraft:/home/scopecraft/.config/scopecraft:ro
```

#### Option C: Copy-Based Strategy
```bash
# Copy files instead of mounting for sensitive operations
docker cp ~/.scopecraft/projects/project-123 container:/tmp/tasks
# Process in container
docker cp container:/tmp/tasks ~/.scopecraft/projects/project-123
```

### Docker Best Practices
1. **Minimal Mounts**: Only mount necessary directories
2. **Read-Only When Possible**: Use `:ro` for configuration and source code
3. **Non-Root Users**: Run containers as non-root user
4. **Resource Limits**: Set CPU/memory limits
5. **Network Isolation**: Restrict container network access

## 4. cross-platform compatibility approach
### Platform Differences

| Platform | Home Directory | Path Separator | Config Location |
|----------|---------------|----------------|----------------|
| macOS    | `/Users/name` | `/` | `~/.config` or `~/Library/` |
| Linux    | `/home/name`  | `/` | `~/.config` |
| Windows  | `C:\Users\name` | `\` | `%APPDATA%` or `%LOCALAPPDATA%` |

### Implementation Strategy

#### 1. Use Cross-Platform Libraries
```typescript
// Example: Use os.homedir() and path.join()
import os from 'os';
import path from 'path';

const scopecraftDir = path.join(os.homedir(), '.scopecraft');
const projectsDir = path.join(scopecraftDir, 'projects');
```

#### 2. Normalize Path Encoding
```typescript
function encodePath(absolutePath: string): string {
  // Convert Windows backslashes to forward slashes first
  const normalized = absolutePath.replace(/\\/g, '/');
  // Apply Claude's encoding scheme
  return '-' + normalized.replace(/\//g, '-');
}
```

#### 3. Handle Platform-Specific Config Locations
```typescript
function getConfigDir(): string {
  if (process.platform === 'win32') {
    return process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  }
  return path.join(os.homedir(), '.config');
}
```

## 5. security and backup considerations
### Backup Tool Compatibility

#### Time Machine (macOS)
- **Status**: ✅ Automatically backs up `~/.scopecraft/`
- **Access**: Hidden directories backed up but require special access methods
- **Recommendation**: No special configuration needed

#### Dropbox/Cloud Sync
- **Risk**: ⚠️ High security risk - may sync sensitive configuration data
- **Recommendation**: Explicitly exclude `~/.scopecraft/` from sync
- **Implementation**: Add to `.dropboxignore` or selective sync exclusions

### Security Implications

#### Data Classification
- **Low Sensitivity**: Task descriptions, progress tracking
- **Medium Sensitivity**: Project paths, configuration preferences
- **High Sensitivity**: API keys, credentials in task logs

#### Mitigation Strategies

1. **Encryption at Rest**
   ```bash
   # Use filesystem-level encryption for sensitive directories
   diskutil apfs createVolume disk1 APFS "Scopecraft" -encryption
   ```

2. **Access Controls**
   ```bash
   # Restrict directory permissions
   chmod 700 ~/.scopecraft/
   chmod 600 ~/.scopecraft/projects/*
   ```

3. **Credential Sanitization**
   - Implement automatic scanning for API keys, tokens
   - Warn users before storing sensitive data
   - Provide redaction capabilities

4. **Audit Logging**
   - Log all read/write operations to task files
   - Track which agents accessed what data
   - Enable compliance with data governance policies

### Backup Strategy Recommendations

1. **Automatic Backup**: Leverage OS-native tools (Time Machine, File History)
2. **Selective Sync**: Exclude from cloud sync services by default
3. **Export Capabilities**: Provide export functions for manual backup
4. **Restore Procedures**: Document recovery processes for data loss scenarios

## Implementation recommendations
### Phase 1: Basic Migration
1. Implement Claude's path encoding scheme
2. Create `~/.scopecraft/projects/` structure
3. Add cross-platform path handling

### Phase 2: Security Hardening
1. Implement access controls and permissions
2. Add credential scanning and sanitization
3. Create backup/restore utilities

### Phase 3: Advanced Features
1. Docker integration with security best practices
2. Encryption at rest options
3. Audit logging and compliance features

## Conclusion
Migrating to `~/.scopecraft/projects/` provides significant benefits for organization, security, and cross-platform compatibility. The key success factors are:

1. **Proven Pattern**: Following Claude's encoding scheme ensures reliability
2. **Security First**: Implementing proper access controls and encryption
3. **Platform Agnostic**: Using cross-platform libraries and path handling
4. **Backup Aware**: Integrating with existing backup strategies while avoiding security risks

The migration should prioritize security and compatibility over convenience, with gradual rollout to ensure stability.
