# Research and design content API specification

---
type: feature
status: done
area: core
tags:
  - research
  - api-design
---


## Instruction
Research current content handling implementation and design a comprehensive API specification for consistent content management.

### Research Areas
1. Current `serializeTaskDocument()` behavior and usage
2. How different clients (CLI, MCP, UI) consume content
3. Existing task `add-par-to-get-tas-con-wit-05A` requirements
4. Custom sections support and limitations
5. Freeform content use cases

### Design Considerations
- Separation of metadata (title, frontmatter) from content
- Support for structured sections vs freeform content
- Backward compatibility requirements
- Symmetric read/write operations
- Content transformation needs

## Tasks
- [x] Analyze current serializeTaskDocument implementation
- [x] Document how each client uses content fields
- [x] Review add-par-to-get-tas-con-wit-05A requirements
- [x] Survey custom section usage patterns
- [x] Design content field structure (content, bodyContent, sections, etc.)
- [x] Define API parameters for content control
- [x] Create API specification document

## Deliverable
Created comprehensive API specification document:
- content-api-specification.md - Full API design with migration strategy
- content-serialization-analysis.md - Root cause analysis of the issue

Key decisions:
- Separate serializeTaskDocument() (files) from serializeTaskContent() (display)
- Add bodyContent field for backward compatibility
- Phased migration approach to avoid breaking changes

## Log
