# Create Technical Requirements Document (TRD)

---
type: chore
status: in_progress
area: cli
priority: high
tags:
  - architecture
  - env
  - services
  - 'expertise:architect'
  - typescript
assignee: architect-agent
---


## Instruction
Create a Technical Requirements Document that defines the implementation approach for the CLI commands. This bridges the gap between what we're building (PRD) and how we'll build it.

## Tasks
- [x] Analyze existing CLI structure and patterns
- [x] Define module architecture and boundaries
- [x] Specify core interfaces and types
- [x] Document dependency choices with rationale
- [x] Create implementation guidelines
- [x] Define testing approach
- [ ] Review with technical stakeholders

## Deliverable
Technical Requirements Document (cli-commands-trd.md) containing:
- ✅ Architecture diagrams (mermaid diagram showing integration points)
- ✅ Module structure (detailed directory layout with new modules)
- ✅ Core interfaces (TypeScript interfaces for all major components)
- ✅ Dependency specifications (NPM packages with rationale)
- ✅ Implementation guidelines (patterns, error handling, configuration)
- ✅ Testing strategy (unit, integration, and mock examples)
- ✅ Implementation examples (concrete code samples)
- ✅ Technical decisions with rationale
- ✅ Migration path from existing scripts
- ✅ Future extensibility considerations

Document Status: READY FOR REVIEW
Location: .tasks/current/impl-cli-env-mgmt-06A/cli-commands-trd.md

## Log
- 2025-06-08: 2025-01-08: TRD task created following PRD approval
- 2025-06-08: 2025-06-08 11:00: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 03_cret-tchncal-rqrmnts-doc-06M (Create Technical Requirements Document)
  - Analysis: type:chore, area:cli, tags include 'architecture' and 'expertise:architect'
  - Selected Mode: Design Mode
  - Reasoning: Task is to create TRD (technical architecture document), has architect expertise tag
  - Loading: Design mode mindset - focus on technical decisions, architecture, interfaces
- 2025-06-08: 2025-06-08 11:10: Analyzed existing CLI structure and patterns:
  - Commander.js based with entity-grouped commands
  - ConfigurationManager singleton for project root handling
  - Existing worktree management in src/scripts/task-worktree.ts
  - ChannelCoder SDK provides native worktree support
  - Read PRD document - clear requirements for env, work, dispatch commands
- 2025-06-08: 2025-06-08 11:20: Created comprehensive TRD document:
  - Defined module structure integrating with existing CLI patterns
  - Specified core interfaces for environment management
  - Documented ChannelCoder SDK integration approach
  - Listed dependencies with clear rationale
  - Provided implementation guidelines following existing patterns
  - Defined testing strategy with examples
  - Added migration path and future extensibility considerations
- 2025-06-08: 2025-06-08 11:25: TRD document complete and ready for technical review:
  - Added implementation examples for key components
  - Included 5 technical decisions with clear rationale
  - Document provides clear bridge between PRD (what) and implementation (how)
  - Left appropriate flexibility for implementers while defining core architecture
- 2025-06-08: 2025-06-08 11:30: === EXECUTION COMPLETE ===
  - Mode Used: Design Mode
  - Status: COMPLETED
  - Deliverable: READY FOR REVIEW
  - Questions: 0 (no blockers encountered)
  - Follow-up: Awaiting technical stakeholder review before implementation phases
- 2025-06-08: 2025-06-08 11:35: Fixed critical issue - removed hardcoded 'scopecraft.worktrees' path:
  - Updated to use dynamic project-based naming: {projectName}.worktrees
  - Added clear examples showing how it works for different projects
  - Ensures the system works for ANY project using Scopecraft, not just Scopecraft itself
  - This is essential for Scopecraft being a general-purpose tool
- 2025-06-08: 2025-06-08 11:40: Enhanced TRD based on feedback:
  - Added emphasis on centralizing ALL configurable values (paths, branch names, Docker image, etc.)
  - Added Zod schema validation pattern for command inputs
  - Emphasized single-source-of-truth principle for magic values
  - Made it clear that path resolution should be isolated, not prescriptive about exact implementation
- 2025-06-08: 2025-06-08 11:45: Reviewed long-term architecture documents and aligned TRD:
  - Moved environment logic to core/ not cli/utils (core is pure domain)
  - Added integration layer for ChannelCoder (easy to swap later)
  - Emphasized thin CLI handlers that adapt to core services
  - Added migration path showing evolution to full service architecture
  - Ensured we're building toward the vision, not against it
- 2025-06-08: 2025-06-08 11:50: Architecture Alignment Review Complete

  Reviewed Against:
  - code-organization.md (service boundaries)
  - system-architecture.md (system philosophy)
  - system-components.md (component design)
  - philosophy.md (Unix philosophy)

  Key Changes Made:
  1. Module structure: cli/utils → core/environment (domain logic in core)
  2. Added integration layer for ChannelCoder (replaceability)
  3. Service-oriented interfaces (future service architecture)
  4. Centralized all magic values (configuration ready)

  Findings:
  - ✅ Aligns with Unix philosophy (simple, composable tools)
  - ✅ Builds toward service architecture (not against it)
  - ✅ Maintains thin CLI layer (just adaptation)
  - ✅ Clear migration path to full services

  Conclusion: TRD provides MVP that consciously evolves toward vision
  Document updated with full Architecture Alignment Review section

## Key areas to define
1. **Architecture Placement**
   - Where each command fits in the codebase structure
   - Module boundaries and dependencies
   - Integration with existing CLI framework

2. **Dependencies**
   - @inquirer/prompts for interactive selection
   - ChannelCoder SDK integration approach
   - Any other required libraries

3. **Core Function Signatures**
   - Environment resolution interface
   - Command handler patterns
   - Shared utility functions

4. **Implementation Patterns**
   - Error handling strategy
   - Configuration management
   - Logging and debugging approach

5. **Testing Strategy**
   - Unit test approach for utilities
   - Integration test patterns
   - Mock strategies for external dependencies

## Constraints
- Must integrate with existing Commander.js structure
- Should follow existing CLI patterns in codebase
- Leave room for implementers to make decisions
- Focus on interfaces, not implementation details
