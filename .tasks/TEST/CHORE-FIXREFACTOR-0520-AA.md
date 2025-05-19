+++
id = "CHORE-FIXREFACTOR-0520-AA"
title = "Fix ProjectConfig refactor - revert incorrect changes"
type = "chore"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "TEST"
+++

# Fix ProjectConfig refactor - revert incorrect changes

## Current State Summary

### What was done correctly
- Added worktree support to identify project root automatically
- Created command-line utilities for project root configuration
- Enhanced functionality for automatic detection of .scopecraft.yaml

### What was done incorrectly
- Changed signatures of 25+ public API methods to require context parameter
- Broke backward compatibility for external tools and integrations
- Made directory configuration (phase/subdirectory paths) configurable when they should remain hardcoded
- Added unnecessary complexity for directory structure configuration

## Detailed List of What Needs to Be Fixed

### 1. Revert Function Signatures
- Remove `context` parameter from all public API methods
- Restore original signatures for backward compatibility
- Only use context internally where needed for root path resolution

Methods to revert include:
- `createPhase`
- `createTask` 
- `updateTask`
- `listTasks`
- `getTask`
- `deleteTask`
- `createArea`
- `updateArea`
- `listAreas`
- `getArea`
- `deleteArea`
- `createFeature`
- `updateFeature`
- `listFeatures`
- `getFeature`
- `deleteFeature`
- (and all other public API methods)

### 2. Remove Configurable Directory Support
- Remove all subdirectory configuration options from ProjectConfig
- Keep phase/subdirectory paths hardcoded as constants
- Only configurable aspect should be the root path

### 3. Restore Backward Compatibility
- Ensure all existing integrations continue to work without changes
- External tools should not need any modifications
- Function calls should work exactly as before

## Implementation Steps

### Step 1: Create Feature Branch
```fish
git checkout -b fix-project-config-refactor
```

### Step 2: Revert Function Signatures
1. Go through each modified file and remove `context` parameter
2. Move context usage to internal helper functions only
3. Update function implementations to use default project root

### Step 3: Remove Directory Configuration
1. Remove subdirectory configuration from ProjectConfig interface
2. Remove directory customization options from .scopecraft.yaml
3. Keep only root path configuration

### Step 4: Update Tests
1. Revert test changes that added context parameter
2. Ensure all tests pass with original function signatures
3. Add tests for worktree root detection

### Step 5: Update Documentation
1. Remove references to configurable directories
2. Focus documentation on root path configuration only
3. Update migration guide to clarify limited scope

## Testing Plan

### Unit Tests
- Verify all functions work without context parameter
- Test backward compatibility with existing code
- Confirm hardcoded directory paths are used

### Integration Tests
- Test with existing external tools and integrations
- Verify worktree support works correctly
- Test .scopecraft.yaml root path configuration

### Manual Testing
1. Install locally and test CLI commands
2. Test MCP server functionality
3. Verify existing workflows still function

### Regression Testing
- Run full test suite
- Check for any broken functionality
- Verify performance is not impacted

## Acceptance Criteria
- [ ] All public API functions have original signatures (no context parameter)
- [ ] External integrations work without any changes
- [ ] Directory paths are hardcoded (not configurable)
- [ ] Only root path can be configured (via .scopecraft.yaml or worktree detection)
- [ ] All tests pass
- [ ] Documentation is updated appropriately
- [ ] No breaking changes for users

## Notes
The goal is to maintain the benefits of worktree support while removing all the breaking changes. We want to enhance the tool's ability to find the project root without changing how it's used.
