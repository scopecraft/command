+++
id = "TASK-IMPLEMENTCLAUDE-0522-AX"
title = "Implement Claude Session Resume in Task UI"
type = "task"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-22"
updated_date = "2025-05-22"
assigned_to = ""
phase = "TEST"
+++

## Overview

Implement session resume functionality for Claude calls in the task UI. The `claude -p` command now outputs session information when streaming responses, and sessions can be resumed using `--resume <session-id>`. The task UI needs to track these session IDs and automatically use them for subsequent messages in the same conversation.

## Research Summary

Current architecture analysis:
- Claude integration uses `claude -p /project:command` syntax in `scripts/utils/claude-helper.ts:249`
- Task UI has existing session management via tmux in `tasks-ui/server/claude-session-handlers.ts`
- Message handling for streaming responses in `tasks-ui/src/lib/claude-message-handler.ts`
- Current sessions are tmux-based for the UI, not Claude CLI sessions

## Key Requirements

### 1. Session ID Extraction
- Parse session ID from Claude streaming responses
- Session appears in system messages during streaming (`msg.type === 'system'`)
- Extract session UUID format like `550e8400-e29b-41d4-a716-446655440000`

### 2. Session Storage & Tracking
- Store session ID per task/conversation context
- Associate session with current task ID
- Persist session across page reloads (localStorage or server-side)

### 3. Resume Implementation
- Modify Claude calls to include `--resume <session-id>` when session exists
- Apply to all subsequent messages in the same conversation
- Handle session expiry/invalid session gracefully

### 4. UI Integration
- No visible UI changes needed initially
- Sessions should work transparently
- Consider optional session status indicator

## Technical Implementation

### Files to Modify

1. **`tasks-ui/src/lib/claude-message-handler.ts`**
   - Add session ID extraction from system messages
   - Emit session ID events for storage

2. **`tasks-ui/src/lib/api/claude-sessions.ts`**
   - Add session ID storage/retrieval functions
   - Extend existing session management

3. **`tasks-ui/server/claude-session-handlers.ts`**
   - Modify Claude command building to include `--resume`
   - Update session start logic

4. **`scripts/utils/claude-helper.ts`**
   - Add resume parameter support to `callClaude` function
   - Include `--resume` flag in command building

### Implementation Steps

1. **Extract Session IDs**
   - Identify where session IDs appear in streaming responses
   - Add parsing logic to message handler
   - Test with various message formats

2. **Extend Session Storage**
   - Add session ID to existing session data structures
   - Implement storage/retrieval in claude-sessions.ts
   - Consider persistence strategy (memory vs localStorage vs server)

3. **Modify Command Building**
   - Update claude-helper.ts to accept resume parameter
   - Modify session handlers to pass resume flag
   - Ensure backward compatibility

4. **Integration Testing**
   - Test session creation and resume
   - Verify conversation continuity
   - Handle edge cases (expired sessions, invalid IDs)

## Acceptance Criteria

- [ ] Session IDs are extracted from Claude streaming responses
- [ ] Session IDs are stored and associated with task contexts
- [ ] Subsequent messages in same conversation use `--resume <session-id>`
- [ ] Session resume works transparently without UI changes
- [ ] Graceful handling of session errors (expired/invalid)
- [ ] Backward compatibility with current session management
- [ ] No breaking changes to existing Claude integration

## Notes

- Session IDs are separate from tmux sessions (Claude CLI vs UI sessions)
- Implementation should be transparent to users initially
- Consider future enhancements like session management UI
- Test with both task and feature contexts
