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
   
   **If project structure exists:**
   - Look at the project structure and infer the domain
   - Update placeholders with project-specific guidance
   - Keep the <!-- PLACEHOLDER --> markers for future customization
   - Add area-specific guidance if the project has clear areas (ui, api, cli, etc.)
   
   **If blank/new project, ask discovery questions:**
   
   **Project Type**: "What type of project is this?"
   - Web application (frontend-focused)
   - API service (backend-focused)  
   - Data pipeline (analytics/ML-focused)
   - Mobile app
   - Library/package
   - Desktop application
   - Other (specify)

   **Tech Stack**: "What's your main technology stack?"
   - Frontend: React, Vue, Angular, Svelte, etc.
   - Backend: Node.js, Python, Go, Rust, Java, etc.
   - Data: Python/pandas, R, Spark, Jupyter, etc.
   - Mobile: React Native, Flutter, Swift, Kotlin, etc.

   **Business Domain**: "What domain are you working in?"
   - E-commerce/retail
   - Financial services
   - Healthcare/biotech
   - Education/edtech
   - Gaming/entertainment
   - Enterprise/B2B tools
   - Open source/developer tools
   - Other (specify)

   **Team Context**: "What's your team structure?"
   - Solo developer
   - Small startup team (2-5 people)
   - Medium team (6-20 people)
   - Large enterprise team
   - Open source project
   - Agency/consulting

   **Use responses to:**
   - Choose appropriate stakeholder context (AI co-founder for startups, AI architect for enterprise)
   - Pre-fill domain-specific placeholders
   - Recommend relevant tools and patterns
   - Set up appropriate project rules and quality gates

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