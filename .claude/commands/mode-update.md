# Update Mode: $ARGUMENTS

Arguments: [modeType] [updateType] [description]
- modeType: exploration, design, implementation, etc.
- updateType: guidance, area-specific, new-variant
- description: what you're updating

🚨 **CRITICAL SAFETY WARNING** 🚨
This is a TEST command. Always save changes to `.tasks/.modes-test/` directory!
NEVER modify `.tasks/.modes/` directly - that's the production directory!

## Your Task

Based on `updateType`:

### If "guidance" - Add General Guidance
1. **Work in TEST directory**:
   ```bash
   ls .tasks/.modes-test/guidance/
   ```

2. **Create or update guidance file IN TEST DIR**:
   - `.tasks/.modes-test/guidance/{technology}-patterns.md`
   - `.tasks/.modes-test/guidance/{domain}-guidance.md`
   - `.tasks/.modes-test/guidance/{process}-workflows.md`

### If "area-specific" - Add Area Guidance
1. **Create area-specific mode file IN TEST DIR**:
   `.tasks/.modes-test/{modeType}/area/{area}.md`

2. **Focus on area-specific concerns**

### If "new-variant" - Create Mode Variant
1. **Create new variant file IN TEST DIR**:
   `.tasks/.modes-test/{modeType}/{variant-name}.md`

## Testing Workflow

1. **⚠️ Always work in `.modes-test/`**
2. **Copy existing mode if updating**:
   ```bash
   cp .tasks/.modes/{modeType}/base.md .tasks/.modes-test/{modeType}/base.md
   ```
3. **Make your changes to the test version**
4. **Show diff for human review**:
   ```bash
   diff .tasks/.modes/{modeType}/base.md .tasks/.modes-test/{modeType}/base.md
   ```

## Safety Reminders

- ✅ Save to `.tasks/.modes-test/`
- ❌ NEVER touch `.tasks/.modes/`
- ✅ Create diffs for human review
- ✅ Test with sample tasks
- ✅ Document all changes

## Output Requirements

1. **Summary of changes made TO TEST DIRECTORY**
2. **Files created or modified IN .modes-test/**
3. **Diff showing what changed**
4. **Instructions for human to review and promote**

Remember: We're building a safe testing environment. All changes need human approval before going to production!