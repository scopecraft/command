# Migrate v2 tasks to standard frontmatter-first format

---
type: chore
status: To Do
area: general
priority: Medium
---

## Instruction

Currently, the v2 task system places the title before the frontmatter, which is non-standard for markdown files. Standard markdown frontmatter should appear at the very beginning of the file.

**Current format (non-standard):**
```markdown
# Task Title

---
type: feature
status: To Do
area: general
---

## Instruction
...
```

**Target format (standard):**
```markdown
---
type: feature
status: To Do
area: general
title: Task Title
---

# Task Title

## Instruction
...
```

This migration will ensure our task files follow the standard markdown frontmatter convention, improving compatibility with other tools and parsers.

## Tasks

- [ ] Update `parseTaskDocument()` in `/src/core/v2/task-parser.ts` to expect frontmatter first
- [ ] Update `serializeTaskDocument()` to output frontmatter at the beginning of the file
- [ ] Add backward compatibility to read both formats during transition
- [ ] Create migration script to convert all existing task files to new format
- [ ] Update template files in `/src/core/v2/template-manager.ts` to use standard format
- [ ] Update all template files in `.tasks/.templates/` directory
- [ ] Test parser with both old and new formats
- [ ] Run migration on all existing tasks
- [ ] Remove backward compatibility after migration is complete
- [ ] Update any documentation that shows task file format examples

## Deliverable

- Updated v2 task parser that reads/writes standard frontmatter format
- Migration tool that converts existing tasks
- All existing tasks migrated to standard format
- Templates updated to generate standard format

## Log
