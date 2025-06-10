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
- [ ] Analyze Claude's path encoding scheme (e.g., /Users/name/Projects/foo → -Users-name-Projects-foo)
- [ ] Document permission implications for AI agents
- [ ] Research Docker volume mounting best practices for home directories
- [ ] Identify cross-platform path handling requirements
- [ ] Consider backup/sync tool compatibility (Time Machine, Dropbox, etc.)
- [ ] Document security considerations

## Deliverable
Technical analysis document covering:
- Path encoding algorithm
- Permission model recommendations  
- Docker mounting strategy
- Cross-platform compatibility approach
- Security and backup considerations

## Log
