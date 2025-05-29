# Add work documents support with automated discovery

---
type: feature
status: To Do
area: core
priority: Medium
tags:
  - unix-philosophy
  - ai-context
  - work-documents
---

## Instruction

Implement minimal Unix-philosophy approach to work documents that supports rich AI context while maintaining simplicity. Enable complex tasks to have supporting documents (design docs, specs, meeting notes) that are automatically discovered and made available to AI agents without requiring explicit linking.

### Background & Vision Alignment

This feature supports the @docs/specs/scopecraft-vision.md vision of work documents living alongside tasks to provide rich context for AI-assisted development. The vision specifically mentions:

- **Mode System creates work documents**: `sc mode design @feature:oauth-login` creates `technical-approach.md`  
- **AI gets rich context**: Agents automatically load task + related patterns + work documents
- **Progressive enhancement**: Start simple (tasks), add documents as complexity grows

From @docs/specs/task-system-v2-specification.md section 2.3:
> Parent task folders MUST contain `_overview.md`  
> Non-task materials MAY be included

And from @docs/specs/knowledge-system-design.md:
> Work documents provide rich context that graduates to knowledge system when valuable

### Design Philosophy: Minimal Unix Approach

Following our Unix philosophy discussion, the approach should be:

1. **Template handling** - Extend existing template system for document types
2. **Initial creation** - Simple `sc doc create <type> <taskId>` command  
3. **Automated discovery** - When loading tasks, automatically list non-task files

**Key principle**: Once you have file paths from automated listing, everything else is standard file operations that any tool (including AI) already knows how to do.

### Proposed Implementation Approach

**Three Core Primitives**:

1. **Document Templates**: Extend `src/templates/` with document types:
   ```
   src/templates/docs/
     design.md          # Technical approach template
     specification.md   # API/interface specs  
     meeting-notes.md   # Stakeholder alignment
     research.md        # Investigation findings
   ```

2. **Document Creation**: Simple CLI command using templates:
   ```bash
   sc doc create design oauth-impl-05A
   # → Creates design.md from template in task folder
   ```

3. **Automated Discovery**: Extend `getTask()` to list non-task files:
   ```typescript
   if (task.metadata.isParentTask) {
     task.relatedFiles = listNonTaskFiles(taskFolder);
   }
   ```

**File Organization**:
```
current/
  oauth-implementation-05C/
    _overview.md           # Required parent task
    01_research-05D.task.md
    02_implement-05E.task.md  
    design.md             # Auto-discovered work document
    api-spec.yaml         # Auto-discovered work document
    meeting-notes.md      # Auto-discovered work document
```

**AI Integration**: `task_get` automatically returns file list, AI uses existing Read tool with paths.

### Questions Requiring Design Review

**Scope & Priority**:
- Should this be implemented before or after completing v2 MCP integration?
- Which document types are highest priority for templates?
- Should we support non-markdown files (YAML, JSON) in discovery?

**Implementation Details**:
- How should document naming conventions work? Free-form or enforced patterns?
- Should document creation be integrated with mode system (`sc mode design` auto-creates design.md)?
- How should we handle document versioning/history within task folders?

**AI Integration**:
- Should `task_get` automatically include document contents or just paths?
- How should large documents (specs, diagrams) be handled for AI context limits?
- Should we provide document-specific MCP tools or rely on generic Read/Write?

**Template System**:
- Should document templates be separate from task templates or integrated?
- How should teams customize document templates for their workflows?
- Should templates support variable substitution (task title, dates, etc.)?

## Tasks

- [ ] Review and validate design approach with project maintainer
- [ ] Finalize document template structure and content
- [ ] Determine integration points with existing mode system
- [ ] Design AI context loading strategy (full content vs. paths)
- [ ] Specify CLI command interface and options
- [ ] Plan integration with existing MCP server tools
- [ ] Consider testing strategy for file discovery and template creation

## Deliverable

**Not ready for implementation** - This is a feature proposal requiring design review and decisions on the questions above. Implementation should only proceed after:

1. Design approach is validated
2. Integration strategy with modes is clarified  
3. AI context loading strategy is determined
4. Template system extension is planned

The deliverable will be a refined implementation plan addressing all design questions.

## Log

- 2025-05-28: Created feature proposal based on Unix philosophy discussion  
- 2025-05-28: Identified minimal approach: template + create + automated discovery
- 2025-05-28: Documented integration points with vision and existing specs
- 2025-05-28: Listed key design questions requiring review before implementation