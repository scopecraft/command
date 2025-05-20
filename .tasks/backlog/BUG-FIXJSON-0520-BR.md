+++
id = "BUG-FIXJSON-0520-BR"
title = "Fix JSON streaming format handling in Task UI for Claude Code"
type = "bug"
status = "🔵 In Progress"
priority = "🔼 High"
created_date = "2025-05-20"
updated_date = "2025-05-20"
assigned_to = ""
phase = "backlog"
tags = [ "AREA:tasks-ui", "AREA:websocket" ]
+++

## Bug Description

Claude Code has slightly changed their output format when streaming JSON, which is affecting the Task UI's ability to properly process and display the streaming JSON responses.

## Technical Context

The Task UI relies on Claude's JSON streaming format for real-time feedback during interactions. The streaming format change needs to be addressed to restore proper functionality.

### Affected Code

The primary areas that need to be updated:

1. **Client-side parsing in PromptPage.tsx** (`tasks-ui/src/components/pages/PromptPage.tsx` - especially the `handleMessage` function around lines 133-179)
   - Current parsing logic expects specific JSON structures
   - May need to update how message blocks, tool calls, and tool results are handled

2. **WebSocket streaming in claude-handler.ts** (`tasks-ui/websocket/claude-handler.ts` - around lines 100-125)
   - Reads from stdout of Claude process
   - Streams the raw content directly to the websocket client

3. **Claude process spawning in streamClaude.ts** (`tasks-ui/streamClaude.ts`)
   - Contains the command to run Claude with `--output-format stream-json`

## Steps to Fix

1. Identify the exact format changes in Claude Code's JSON streaming output
   - Compare old format vs new format samples
   - Document the specific differences

2. Update the client-side parsing logic in `PromptPage.tsx`
   - Modify the `handleMessage` function to handle both old and new formats for compatibility
   - Update type definitions if needed

3. Test with the latest Claude Code version
   - Verify all functionalities still work (text messages, tool usage, tool results)
   - Ensure streaming updates properly render in the UI

4. Add defensive parsing to handle potential future format changes
   - More robust error handling
   - Graceful degradation for unexpected formats

## Testing

- Test with multiple JSON streaming responses from Claude Code
- Verify tool calls and tool results display correctly
- Ensure streaming text updates render properly
- Check for any UI rendering issues during streaming

## Related Information

- Claude Code was recently updated which introduced the format change
- The Task UI uses WebSocket to stream Claude's responses in real-time
- The format change appears to be minor but affects the parsing logic
