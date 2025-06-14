# Initialize Modes for $ARGUMENTS

You are helping set up execution modes for a new Scopecraft project.

## Your Task

1. **Create the modes directory structure**:
   ```bash
   mkdir -p .tasks/.modes/{exploration,design,implementation,orchestration,planning,meta,guidance}/area
   ```

2. **Copy the base mode templates** from the templates directory:
   - Start with the minimal templates provided
   - Each mode should have at least a `base.md` file
   - The orchestration/autonomous.md is critical for automated execution

3. **Customize for the project**:
   - Look at the project structure and infer the domain
   - Update placeholders with project-specific guidance
   - Keep the <!-- PLACEHOLDER --> markers for future customization
   - Add area-specific guidance if the project has clear areas (ui, api, cli, etc.)

4. **Create essential guidance files**:
   - `.tasks/.modes/guidance/README.md` - Explaining the mode system
   - Any technology-specific guidance based on project stack

5. **If additional modes are specified as arguments**:
   Create additional modes beyond the standard set (exploration, design, implementation, orchestration, planning, meta). For each custom mode:
   - Create `.tasks/.modes/{mode_name}/base.md`
   - Define role, mission, workflow, and deliverable format
   - Use placeholders for customization points

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

## Important Notes

- Keep initial modes minimal - teams will customize over time
- Use <!-- PLACEHOLDER: description --> with examples for customization points
- Ensure orchestration/autonomous.md is complete for task automation
- Document any project-specific patterns you notice

## Output

Provide:
1. Summary of modes created
2. Any project-specific customizations made
3. Suggestions for additional modes based on project type
4. Next steps for the team to customize further