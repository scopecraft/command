# Initialize Modes for $ARGUMENTS

Arguments: [project_name] [test_directory] (optional)
- project_name: Name of the project to initialize modes for
- test_directory: Optional test directory suffix (default: "modes-test")

🚨 **CRITICAL SAFETY WARNING** 🚨
This is a TEST command. Always save modes to `.tasks/.modes-test-*/` directory!
NEVER save directly to `.tasks/.modes/` - that's the production directory!

## Your Task

1. **Create the TEST modes directory structure**:
   ```bash
   # If test_directory provided: .tasks/.modes-test-{test_directory}/
   # If not provided: .tasks/.modes-test/
   mkdir -p .tasks/.modes-test-{test_directory}/{exploration,design,implementation,orchestration,planning,meta,guidance}/area
   ```

2. **Copy and customize the base mode templates**:
   - Use the templates from `src/templates/modes/` as starting points
   - Each mode should have at least a `base.md` file
   - The orchestration/autonomous.md is critical for automated execution

3. **⚠️ IMPORTANT: Save everything to the test directory**
   - `.tasks/.modes-test-{test_directory}/exploration/base.md`
   - `.tasks/.modes-test-{test_directory}/design/base.md`  
   - `.tasks/.modes-test-{test_directory}/implementation/base.md`
   - etc.

4. **Customize for the project**:
   - Look at the project structure and infer the domain
   - Update placeholders with project-specific guidance
   - Keep the `<!-- PLACEHOLDER -->` markers for future customization
   - Add area-specific guidance if the project has clear areas

5. **Create essential guidance files**:
   - `.tasks/.modes-test/guidance/README.md` - Explaining the mode system
   - Any technology-specific guidance based on project stack

6. **If additional modes are specified as arguments**:
   Create additional modes beyond the standard set (exploration, design, implementation, orchestration, planning, meta)

## Testing Workflow

After creating the modes:

1. **Review the generated structure**:
   ```bash
   find .tasks/.modes-test -type f -name "*.md" | head -10
   ```

2. **Test with a sample task**:
   - Create a test task that would use one of your modes
   - See if the mode provides clear guidance

3. **Human review step**:
   - Show the human what you created
   - Get feedback on customizations
   - Make adjustments as needed

4. **Manual promotion to production**:
   - Human decides when to copy from `.modes-test/` to `.modes/`
   - This ensures quality control

## Mode Template Structure

Each mode file should include:
```markdown
---
name: mode_name
description: One-line description
---

<role>
Define the mindset for this mode
</role>

<mission>
What tasks in this mode aim to achieve
</mission>

<workflow>
Standard steps or phases
</workflow>

<deliverable_format>
How results should be structured
</deliverable_format>
```

## Output

Provide:
1. Summary of modes created in `.modes-test/`
2. Project-specific customizations made
3. Suggestions for additional modes based on project type
4. Next steps for human review and promotion to production

Remember: This creates a SAFE TEST environment. Nothing goes to production `.modes/` until human review!