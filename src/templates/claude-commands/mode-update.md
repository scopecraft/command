# Update Mode: $ARGUMENTS

Arguments: [modeType] [updateType] [description]
- modeType: exploration, design, implementation, etc.
- updateType: guidance, area-specific, new-variant
- description: what you're updating

You are helping refine an existing execution mode based on experience and feedback.

## Your Task

Based on `updateType`:

### If "guidance" - Add General Guidance
1. **Navigate to the guidance directory**:
   ```bash
   ls .tasks/.modes/guidance/
   ```

2. **Create or update guidance file**:
   - For technology: `{technology}-patterns.md`
   - For domain: `{domain}-guidance.md`
   - For process: `{process}-workflows.md`

3. **Structure the guidance**:
   ```markdown
   # {Title} Guidance
   
   ## When to Use
   Specific scenarios where this guidance applies
   
   ## Key Patterns
   - Pattern 1: Description and example
   - Pattern 2: Description and example
   
   ## Common Pitfalls
   What to avoid and why
   
   ## Examples
   Concrete examples of good implementation
   ```

### If "area-specific" - Add Area Guidance
1. **Create area-specific mode file**:
   `.tasks/.modes/{modeType}/area/{area}.md`

2. **Focus on area-specific concerns**:
   - File patterns for this area
   - Testing approaches
   - Common tools and utilities
   - Integration patterns
   - Review criteria

### If "new-variant" - Create Mode Variant
1. **Create new variant file**:
   `.tasks/.modes/{modeType}/{variant-name}.md`

2. **Inherit from base mode** but customize:
   - Role and mindset adjustments
   - Workflow modifications
   - Different tool emphasis
   - Specialized deliverable formats

## Mode Update Best Practices

1. **Preserve existing structure** - Don't break what works
2. **Add incrementally** - Small, focused improvements
3. **Document changes** - Note what changed and why
4. **Test with real tasks** - Validate improvements work
5. **Keep placeholders** - Maintain customization points

**🔒 CRITICAL: NEVER MODIFY THESE PROTECTED SECTIONS:**
- `<scopecraft_requirements>` sections - System integration requirements
- `<external_tools>` sections - Tool usage requirements  
- Task metadata format specifications
- Dependency management rules (sequence numbers)
- Parent task orchestration requirements
- MCP tool usage instructions
- Status update protocols
- Area enforcement protocols
- Progress tracking requirements
- Completion protocols

**These are SYSTEM REQUIREMENTS that enable Scopecraft to function!**
Only update within PLACEHOLDER sections and project-specific content.

## Content Guidelines

- **Be specific**: Provide concrete, actionable guidance
- **Use examples**: Show don't just tell
- **Consider context**: How does this fit with other modes?
- **Stay focused**: Each piece of guidance should have a clear purpose

## Output Requirements

1. **Summary of changes made**
2. **Files created or modified**
3. **How the improvement addresses the need described**
4. **Suggestions for testing the updated mode**

Remember: Mode updates should feel like natural evolution, not disruptive change.