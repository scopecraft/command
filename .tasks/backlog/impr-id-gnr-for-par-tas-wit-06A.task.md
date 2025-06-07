# Improve ID generation algorithm with smarter word selection

---
type: feature
status: todo
area: core
tags:
  - id-generation
  - readability
  - all-tasks
priority: medium
---


## Instruction
Improve the ID generation algorithm to create more readable IDs for ALL task types (parent tasks, single tasks, and subtasks). The current algorithm tries to include every word from the title, resulting in unreadable IDs where each word is reduced to 3 letters.

## Tasks
- [ ] Analyze current `abbreviateTaskName()` function in `name-abbreviator.ts`
- [ ] Create a list of filler words to skip ("for", "with", "and", "the", "to", "in", "of")
- [ ] Implement smart word selection algorithm that:
  - Identifies key nouns and verbs
  - Skips filler words
  - Prioritizes words by importance
  - Limits to 3-4 words maximum
- [ ] Update abbreviation logic to keep words at 4+ characters when possible
- [ ] Update tests with the exact examples provided
- [ ] Test with existing task titles (parent, single, subtask) to ensure improvement
- [ ] Consider slightly increasing the 30-char limit if needed

## Deliverable
An updated ID generation algorithm that produces more readable IDs for ALL task types by selecting fewer, more meaningful words and keeping them at 4+ characters each. The IDs should match the provided examples exactly. This single algorithm will be used for parent tasks, single tasks, and subtasks alike.

## Log

## Problem
Parent tasks with long descriptive titles get IDs like:
- `implmnt-cor-sea-sol-for-tas-06A` (7 words, hard to read)
- `add-wor-doc-sup-wit-tem-dsc-06A` (7 words, very unclear)

## Solution requirements
1. **Select only 3-4 most important words** from the title
2. **Skip filler words** like "for", "with", "and", "the", "to"
3. **Keep words at 4+ letters** for better readability
4. **Smart word selection** focusing on key nouns and verbs

## Implementation examples
These are the exact transformations we want:

```
"Implement Core Search Solution for Tasks and Documents"
→ Take: implement, search, tasks
→ ID: impl-search-tasks-06A

"Add work document support with template discovery and UI editing"
→ Take: document, template, edit
→ ID: docu-template-edit-06A

"Redesign task create and edit UI for V2"
→ Take: redesign, task, create, edit
→ ID: reds-task-create-edit-06A
```

## Technical details
- Current limit is 30 characters for the abbreviated portion
- Consider increasing limit slightly if needed for readability
- Focus on making parent task IDs more meaningful and memorable
