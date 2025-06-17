# Mode Creation Workflows - Requirements Document

## Overview

This document outlines the requirements for implementing mode creation and management workflows in Scopecraft. The goal is to provide a streamlined experience for users to create, customize, and manage modes that define task creation behaviors.

## Background

Modes in Scopecraft are configuration presets that define:
- Default task templates
- Workflow behaviors
- Task creation patterns
- Custom prompts and instructions

Currently, modes must be manually created by editing YAML files in the `.tasks/modes/` directory. This document defines requirements for automating and improving this workflow.

## Core Requirements

### 1. Mode Creation Command

**Command**: `sco mode create [name]`

**Requirements**:
- Interactive wizard-based creation flow
- Support for both simple and advanced mode creation
- Validation of mode configuration
- Automatic file creation in correct location

**Interactive Flow**:
1. Mode name input (if not provided)
2. Mode description
3. Template selection (single or multiple)
4. Workflow configuration
5. Custom instructions (optional)
6. Review and confirmation

### 2. Mode Templates

**Predefined Mode Types**:
- **Simple**: Single template, basic configuration
- **Multi-template**: Multiple templates with selection logic
- **Workflow**: Templates organized by workflow stage
- **Custom**: Fully customizable configuration

**Template Configuration Options**:
- Default template selection
- Template selection criteria
- Context-aware template switching
- Custom template creation inline

### 3. Mode Management Commands

**List Modes**: `sco mode list`
- Display all available modes
- Show mode descriptions and key configuration
- Indicate which mode is currently active
- Filter by mode type or characteristics

**Show Mode Details**: `sco mode show <name>`
- Display full mode configuration
- Show associated templates
- Display usage statistics (if tracked)
- Show example task creation commands

**Edit Mode**: `sco mode edit <name>`
- Interactive editing of existing modes
- Support for adding/removing templates
- Modify selection criteria
- Update descriptions and metadata

**Delete Mode**: `sco mode delete <name>`
- Confirmation prompt
- Check for mode usage/dependencies
- Safe deletion with backup option

### 4. Mode Activation and Usage

**Set Default Mode**: `sco mode set-default <name>`
- Configure default mode for task creation
- Project-level default configuration
- Override system defaults

**Mode Selection During Task Creation**:
- `sco task create --mode <name>`
- Mode auto-detection based on context
- Mode suggestions based on task type

### 5. Advanced Mode Features

**Mode Inheritance**:
- Modes can extend other modes
- Override specific configuration
- Compose modes from multiple sources

**Context-Aware Modes**:
- Modes that adapt based on:
  - Current directory
  - Git branch
  - Time of day
  - Task history
  - User preferences

**Mode Sharing**:
- Export modes to shareable format
- Import modes from files or URLs
- Mode marketplace/registry concept

### 6. Mode Configuration Schema

```yaml
name: string
description: string
version: string
extends: string (optional)
templates:
  default: string
  selection:
    - condition: string
      template: string
  custom:
    - name: string
      content: string
workflows:
  default_location: string
  transitions:
    - from: string
      to: string
      condition: string
prompts:
  task_creation: string
  template_selection: string
metadata:
  author: string
  created: date
  tags: array
```

### 7. Integration Requirements

**CLI Integration**:
- Seamless integration with existing task creation flow
- Mode hints and suggestions
- Clear mode indication in command output

**MCP Integration**:
- Mode selection in MCP task creation
- Mode configuration via MCP
- Mode-aware task suggestions

**Git Integration**:
- Modes stored in version control
- Mode changes tracked
- Mode sharing via git repositories

### 8. User Experience Requirements

**Discoverability**:
- Clear documentation of available modes
- Mode recommendations based on usage
- Interactive mode exploration

**Simplicity**:
- Simple modes should be trivial to create
- Advanced features should be optional
- Progressive disclosure of complexity

**Feedback**:
- Clear confirmation of mode operations
- Helpful error messages
- Mode validation feedback

### 9. Technical Requirements

**Storage**:
- Modes stored in `.tasks/modes/` directory
- YAML format for human readability
- Automatic schema validation

**Performance**:
- Fast mode loading and switching
- Efficient mode listing
- Cached mode configurations

**Compatibility**:
- Backward compatibility with existing modes
- Migration path for old configurations
- Version management for modes

## Implementation Phases

### Phase 1: Basic Mode Creation
- `sco mode create` command
- Simple mode templates
- Basic mode listing

### Phase 2: Mode Management
- Edit and delete commands
- Mode details display
- Default mode configuration

### Phase 3: Advanced Features
- Mode inheritance
- Context-aware modes
- Custom template creation

### Phase 4: Sharing and Collaboration
- Mode import/export
- Mode registry concepts
- Team mode sharing

## Success Criteria

1. Users can create a new mode in under 2 minutes
2. Mode creation reduces task creation time by 50%
3. 80% of users successfully create custom modes
4. Mode system handles 100+ modes efficiently
5. Zero configuration required for basic usage

## Future Considerations

- AI-assisted mode creation
- Mode analytics and optimization
- Cross-project mode sharing
- Mode marketplace ecosystem
- Visual mode builder interface

## Related Documentation

- Task Template System
- Workflow Architecture
- CLI Command Structure
- MCP Integration Guide

---

## Meeting Notes - Brainstorming Session (2025-06-14)

### Key Discussion Points

#### Simplified Approach
- Need meta mode for maintaining template modes
- Template pack should be minimal - system modes (auto/orchestrate) well-defined, others as stubs
- Two implementation paths: Claude commands (immediate) and MCP (long-term)

#### Claude Commands Integration
- Can use `.claude/commands/` for prompt files that accept arguments
- Similar to ChannelCoder but simpler
- No code changes needed for immediate solution

#### Template Design Philosophy
- Use placeholders with inline guidance rather than verbose instructions
- Example:
  ```markdown
  <role>
  <!-- PLACEHOLDER: Define the mindset for {MODE_NAME} mode -->
  <!-- Example: You are a thorough researcher who explores all angles -->
  </role>
  ```

#### Type 1 vs Type 2 Thinking Framework
- **Type 2** (current): AI reads task, thoughtfully composes guidance (slow, deliberate)
- **Type 1** (future): Core lib instantly combines modes based on tags (automatic, fast)
- Scopecraft goal: Prototype in Type 2, identify patterns, move to Type 1
- Need core lib to help combine modes/guidance based on task tags

#### Testing Strategy
- Use separate directory (`.tasks/.modes-test/`) to avoid touching production modes
- Command needs `--test-dir` flag or similar
- Workflow: Create in test → Preview/diff → Confirm → Move to real `.modes/`

#### Open Questions
1. Placeholder design - inline examples vs external references?
2. Should we log/track AI mode composition patterns for Type 1 system?
3. Testing workflow details - diff preview, confirmation flow?

#### Next Actions
- Design minimal template pack with placeholders
- Prototype Claude command for mode-init
- Consider pattern discovery mechanism for Type 1 evolution

#### MVP Approach for Immediate Implementation
- Keep current mode structure (.modes/exploration/, implementation/, etc.)
- Create minimal mode template pack with placeholders
- Implement using Claude commands (no code changes needed)
- Focus on helping users initialize and update modes
- Test approach in new project

#### Implementation Details
1. **Mode Template Pack**:
   - Minimal base modes with placeholder guidance
   - Focus on orchestration/autonomous.md (system-critical)
   - Other modes as simple stubs with clear placeholders
   
2. **Claude Commands**:
   - `.claude/commands/mode-init.md` - Initialize modes for project
   - `.claude/commands/mode-update.md` - Add guidance to existing modes
   - Use placeholders that guide users on what to add

3. **Testing Strategy**:
   - Create modes in test directory first
   - Validate structure before moving to .modes/
   - Keep it simple - no complex logic