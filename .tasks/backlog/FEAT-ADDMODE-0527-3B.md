+++
id = "FEAT-ADDMODE-0527-3B"
title = "Add mode selection and dynamic input to explore-idea"
type = "mdtm_feature"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-27"
updated_date = "2025-05-27"
assigned_to = ""
phase = "backlog"
tags = [ "enhancement", "explore-idea", "channelcoder" ]
+++

# Add Mode Selection and Dynamic Input Collection to explore-idea.ts

## Context

We have a working parallel idea exploration script (`scripts/explore-idea.ts`) that currently only runs one mode (explore-idea.md). We want to enhance it to:

1. Allow selection from multiple prompt modes
2. Dynamically read input schemas from prompt files
3. Collect required inputs before execution

## Current State

### Files to Review
1. **`scripts/explore-idea.ts`** - Current implementation using detached execution
2. **`scripts/prompts/explore-idea.md`** - Example prompt with frontmatter
3. **`dispatch`** - Bash script showing mode selection pattern (reads .claude/commands/*.md)
4. **channelcoder documentation** - Shows `loadPromptFile` API

### Key Code Patterns

From dispatch script (mode selection):
```bash
# Line 182-190 in dispatch
local modes=$(ls -1 "$commands_dir"/*.md 2>/dev/null | xargs -n1 basename | sed 's/\.md$//')
echo -e "none\n$modes" | gum choose --header "Select command mode:"
```

From channelcoder docs:
```typescript
import { loadPromptFile } from 'channelcoder';

const { config, content } = await loadPromptFile('prompts/my-prompt.md');

if (config.input._def?.typeName === 'ZodObject') {
  const shape = config.input._def.shape();
  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    // Generate UI based on type
  }
}
```

## Implementation Plan

### Phase 1: Mode Discovery
1. List all .md files in `scripts/prompts/`
2. Filter out non-prompt files (check for valid frontmatter)
3. Present selection menu in interactive mode

### Phase 2: Schema Parsing
1. Use `loadPromptFile` to load selected prompt
2. Extract input schema from config
3. Map Zod types to input collection:
   - ZodString → text input
   - ZodNumber → number input  
   - ZodBoolean → yes/no prompt
   - ZodArray → comma-separated input
   - ZodOptional → allow empty input

### Phase 3: Dynamic Input Collection
1. For each required field, prompt user
2. Show field name and type
3. Validate input against schema
4. Handle optional fields appropriately

### Phase 4: Integration
1. Update processJob to accept mode parameter
2. Pass collected inputs to detached()
3. Update UI to show mode in job display

## Code Structure

```typescript
// New functions to add:

async function listAvailableModes(): Promise<string[]> {
  // List and validate prompt files
}

async function selectMode(): Promise<string | null> {
  // Interactive mode selection
}

async function collectInputsForMode(modePath: string): Promise<Record<string, any>> {
  // Use loadPromptFile and generate inputs
}

async function processJobWithMode(job: IdeaJob, mode: string, inputs: Record<string, any>) {
  // Enhanced processJob
}
```

## Testing

1. Create test prompts with different input schemas
2. Test with missing optional fields
3. Test with invalid inputs
4. Verify parallel execution still works

## Success Criteria

- [ ] Can select from multiple prompt modes
- [ ] Correctly reads and parses input schemas
- [ ] Dynamically collects all required inputs
- [ ] Maintains backward compatibility (direct CLI still works)
- [ ] Shows mode name in job status
- [ ] Handles errors gracefully

## Notes

- Keep the simple "description only" mode for quick ideas
- Consider caching parsed schemas for performance
- The readline approach should work for basic types
- For complex types, might need to simplify or provide JSON input
