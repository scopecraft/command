# Create migration guide from old scripts to new CLI

---
type: documentation
status: done
area: docs
---


## Instruction
Create a comprehensive migration guide to help users transition from the old shell scripts (implement, work, dispatch) to the new unified CLI commands.

**Migration Guide Requirements**:
1. Script-to-Command mapping:
   - `./implement <taskId>` → `sc env <taskId>`
   - `./work [prompt]` → `sc work [taskId] [prompt]`
   - `./dispatch <taskId>` → `sc dispatch <taskId>`
   - Show all flag/option equivalents

2. Workflow comparisons:
   - Old: Multiple scripts with implicit behavior
   - New: Composable commands with explicit control
   - Benefits of the new approach

3. Feature improvements:
   - Better error handling
   - Session management
   - Tmux support
   - Parent task awareness
   - Mode prompt integration

4. Breaking changes:
   - Different command structure
   - New environment management
   - Session tracking changes

**Target Audience**:
- Existing users familiar with old scripts
- Need clear before/after examples
- Want to understand benefits
- May have muscle memory to retrain

**Delivery Format**:
- Step-by-step migration guide
- Side-by-side comparisons
- Common scenarios covered
- Troubleshooting section

## Tasks
- [x] Analyze old script functionality
- [x] Map all features to new commands
- [x] Create command translation table
- [x] Write workflow migration examples
- [x] Document new features/benefits
- [x] Add breaking changes section
- [x] Create quick reference card
- [x] Add troubleshooting Q&A
- [x] Include shell alias suggestions
- [x] Review with fresh eyes

## Deliverable
1. **Migration Guide**:
   - `docs/03-guides/migration-from-scripts.md`
   - Complete script-to-CLI mapping
   - Step-by-step migration process
   - Common workflow examples

2. **Quick Reference**:
   - Command translation table
   - Feature comparison chart
   - Shell alias recommendations
   - Cheat sheet for common tasks

3. **Support Materials**:
   - FAQ for common issues
   - Troubleshooting guide
   - Benefits summary
   - Tips for adapting workflows

## Log
- 2025-06-09: 2025-01-26 15:47: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 14_cret-mgrton-scri-cli-06L
  - Analysis: type:documentation, area:docs, creating migration guide with specific deliverables
  - Selected Mode: implementation (documentation creation with concrete outputs)
  - Reasoning: Task involves building documentation deliverables, analyzing existing code, and creating practical user guides
  - Loading: Implementation mode focused on documentation area
  - Status: Starting task analysis
- 2025-06-09: 2025-01-26 15:53: Analyzed old scripts and new CLI structure
  - Old scripts: implement, dispatch (complex bash with tmux/gum), work script not found
  - New CLI: sc env, sc work, sc dispatch commands
  - Key differences: unified command structure, better session management
  - Status: Ready to create migration documentation
- 2025-06-09: 2025-01-26 16:02: Created comprehensive migration guide
  - File: docs/03-guides/migration-from-scripts.md
  - Includes: command mapping, workflow comparisons, migration scenarios
  - Features: troubleshooting, shell integration, FAQ section
  - Status: Core migration guide complete, creating quick reference next
- 2025-06-09: 2025-01-26 16:06: === EXECUTION COMPLETE ===
  - Mode Used: implementation
  - Status: COMPLETED
  - Deliverable: READY
  - Created Files:
    * docs/03-guides/migration-from-scripts.md (comprehensive migration guide)
    * docs/03-guides/migration-quick-reference.md (quick reference and cheat sheet)
  - All requirements met: command mapping, workflow comparisons, troubleshooting, shell integration
  - Questions: None - task fully completed
  - Follow-up: Documentation ready for user review and feedback
