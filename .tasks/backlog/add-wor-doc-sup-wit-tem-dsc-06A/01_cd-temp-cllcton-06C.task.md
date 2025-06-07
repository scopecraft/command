# Create document template collection

---
type: feature
status: todo
area: core
tags:
  - templates
  - documentation
  - content-design
---


## Instruction
Create an initial collection of document templates that guide AI agents in creating useful work documents with clear structure.

## Context  
- Templates will be stored in src/templates/docs/
- Templates should be markdown files with helpful structure
- Must work well with AI agents creating documents autonomously
- Should cover common software development documentation needs

## Template Requirements

### Structure Guidelines
- Start with a clear purpose statement
- Include section headers to guide content organization
- Add prompting questions or bullet points to guide thinking
- Keep templates flexible, not overly prescriptive

### Essential Templates to Create
1. **design.md** - Technical approach and architecture decisions
2. **research.md** - Investigation findings and analysis  
3. **meeting-notes.md** - Discussion summaries and decisions
4. **analysis.md** - Problem analysis and solution evaluation

### Additional Templates (if time permits)
- specification.md - API/interface specifications
- retrospective.md - What worked, what didn't, learnings
- brainstorm.md - Idea exploration and options

## Quality Criteria
- Templates should feel helpful, not constraining
- Clear enough to guide, flexible enough to adapt
- Work well for both human and AI users
- Include examples or prompts where helpful

## Tasks
- [ ] Review existing task templates for style/approach consistency
- [ ] Create design.md template with architecture focus
- [ ] Create research.md template with investigation structure  
- [ ] Create meeting-notes.md template with decision tracking
- [ ] Create analysis.md template with evaluation framework
- [ ] Test templates by using them to create sample documents
- [ ] Refine based on what feels natural vs forced

## Deliverable
A collection of 4-7 document templates in src/templates/docs/ that:
- Guide document creation without being prescriptive
- Work well for AI agents creating documents autonomously
- Cover the most common documentation needs
- Feel natural and helpful to use

## Log
