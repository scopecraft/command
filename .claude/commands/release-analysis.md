---
allowedTools:
  - "Bash(git log:*)"
  - "Bash(git diff:*)" 
  - "Bash(git show:*)"
  - "Bash(cd:*)"
  - "Read"
  - "Write"
---

# URGENT: Complete Release Analysis Task

**YOUR TASK**: Analyze git changes since vv0.10.5 and create THREE FILES immediately.

## Context
- Current Version: 0.10.7
- Last Tag: v0.10.5  
- Release Date: 2025-05-22
- Target Version: 

## Step 1: Analyze Changes
Run these commands to understand the changes:
```bash
git log v0.10.5..HEAD --oneline
git diff v0.10.5..HEAD --stat
```

## Step 2: Create Files IMMEDIATELY

You MUST create these three files:

### 1. Create `.release/version.json`
```json
{
  "current_version": "0.10.7",
  "new_version": "X.Y.Z",
  "bump_type": "major|minor|patch",
  "confidence": "high|medium|low", 
  "reasoning": "Brief explanation",
  "breaking_changes": false,
  "notable_features": ["feature1", "feature2"]
}
```

### 2. Create `.release/changelog.md`
Standard changelog format focusing on USER-FACING changes only:
```markdown
## [X.Y.Z] - 2025-05-22

### Added
- **Feature Name**: User benefit description

### Changed  
- **Feature Name**: What changed for users

### Fixed
- **Issue Area**: What was broken and now works
```

### 3. Create `.release/metadata.json`
```json
{
  "success": true,
  "version": "X.Y.Z",
  "release_date": "2025-05-22",
  "summary": "One-line release summary",
  "breaking_changes": false,
  "highlights": ["Most important change", "Second most important"],
  "categories_used": ["Added", "Fixed"],
  "total_changes": 5
}
```

## CRITICAL INSTRUCTIONS

1. **START IMMEDIATELY** - Do not ask questions or seek clarification
2. **CREATE ALL THREE FILES** - Use the Write tool to create each file
3. **FOCUS ON USER IMPACT** - Only include changes that affect end users
4. **USE SEMANTIC VERSIONING** - Major (breaking), Minor (features), Patch (fixes)

**BEGIN NOW** - Create the three files based on your git analysis.