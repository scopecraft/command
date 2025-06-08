---
title: "Archived Documentation"
description: "Historical documentation preserved for reference"
version: "1.0"
status: "archived"
category: "archive"
updated: "2025-01-07"
authors: ["system"]
---

# Archived Documentation

This folder contains historical documentation that has been superseded by newer versions or represents early thinking that has evolved. These documents are preserved for:

1. **Historical Reference** - Understanding how the project evolved
2. **Recovery** - In case we need to revisit old ideas
3. **Learning** - Seeing what approaches didn't work and why

## Archive Structure

### v1-specs/
Original specifications that have been replaced by v2 versions:
- `task-system-design.md` → Replaced by `task-system-v2-specification.md`
- `mode-system-design.md` → Replaced by `mode-system-v2.md`
- `ai-first-knowledge-system-vision.md` → Concept not fully implemented

### old-architecture/
Early architecture documents superseded by new structured docs:
- `system-architecture.md` → Replaced by `/docs/02-architecture/system-architecture.md`
- `mcp-architecture.md` → Replaced by `/docs/02-architecture/service-architecture.md`
- `worktree-dashboard-architecture.md` → Never implemented

### outdated-guides/
Guides that reference old concepts or implementations:
- `development-modes-guide.md` → Superseded by mode system v2
- `orchestration-automation-vision.md` → Replaced by current orchestration architecture
- `WORKTREE-USAGE.md` → Functionality now integrated into core
- `websocket-claude.md` → Replaced by ChannelCoder implementation
- `implementation-priorities.md` → Use task system for current priorities

## Important Note

These documents may contain outdated or incorrect information. Always refer to the active documentation in:
- `/docs/00-overview/` - Current overview and quick start
- `/docs/01-concepts/` - Active conceptual documentation
- `/docs/02-architecture/` - Current architecture documents
- `/docs/specs/` - Current specifications (v2 versions)

## Why Archive Instead of Delete?

1. **Evolution History** - Shows how thinking evolved
2. **Valuable Ideas** - Some concepts might be worth revisiting
3. **Decision Context** - Explains why we moved away from certain approaches
4. **No Information Loss** - Preserves all work done