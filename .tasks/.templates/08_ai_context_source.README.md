# Documentation: Template `08_ai_context_source.md`

## Purpose

This template is used for creating structured context files intended primarily for consumption by AI assistants. These files provide specific knowledge, rules, best practices, API specifications, or other reference material to guide AI behavior and improve response quality. They are typically stored in `.context/` or `.roo/context/` directories.

## Usage

1.  Copy `.ruru/templates/toml-md/08_ai_context_source.md` to the appropriate context directory.
2.  Rename the file descriptively (e.g., `ctx_react_hooks_reference.md`, `ctx_python_style_guide.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, paying close attention to `context_type`, `scope`, `target_audience`, and `granularity` to help the AI understand how to use the file.
4.  Replace the placeholder content in the Markdown body with the actual context information, structured clearly. Include usage instructions for the AI in the "Purpose / How to Use" section.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for this context document.
    *   Example: `"CTX-REACT-001"`, `"CTX-STYLE-PYTHON-001"`

*   `title` (String, Required):
    *   A human-readable title describing the context provided.
    *   Example: `"React Hooks Reference"`, `"Python Style Guide (PEP 8 Summary)"`

*   `context_type` (String, Required):
    *   The primary type or purpose of the context information. This is a key field for AI interpretation.
    *   Example values: `"reference"`, `"tutorial"`, `"conceptual"`, `"best_practices"`, `"api_spec"`, `"troubleshooting"`, `"rules"`, `"configuration"`, `"glossary"`.

*   `scope` (String, Required):
    *   Describes the specific area, technology, or process covered by the context.
    *   Example: `"React state management hooks"`, `"MDTM Task Status definitions"`, `"Project API endpoints"`

*   `target_audience` (Array of Strings, Required):
    *   Lists the AI modes or user roles this context is most relevant for. Use `"all"` if universally applicable.
    *   Example: `["react-specialist"]`, `["all"]`, `["project-manager", "technical-writer"]`

*   `granularity` (String, Required):
    *   Indicates the level of detail provided.
    *   Example values: `"overview"`, `"detailed"`, `"specific_example"`, `"ruleset"`, `"api_reference"`.

*   `version` (String, Optional):
    *   Version of the tool, library, framework, or concept described.
    *   Example: `"React 18"`, `"MDTM v1.1"`, `"API v2"`

*   `last_updated` (String, Required):
    *   The date the context was last verified or significantly updated, in `YYYY-MM-DD` format.

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/08_ai_context_source.README.md"`

*   `related_context` (Array of Strings, Optional):
    *   List of IDs or file paths to other relevant context documents.
    *   Example: `["CTX-REACT-002", ".ruru/docs/state-management-patterns.md"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization.
    *   Example: `["react", "hooks", "state", "reference"]`, `["style-guide", "python", "pep8"]`

*   `source_url` (String, Optional):
    *   URL if this context was derived or summarized from an external source (e.g., official documentation).

*   `relevance` (String, Optional):
    *   A hint for the AI about the importance or specific use case.
    *   Example: `"High relevance for code generation"`, `"Use for validating task statuses"`, `"Consult before designing new APIs"`

## Markdown Body

The section below the `+++` TOML block contains the human-readable (and AI-readable) context:

*   `# << HUMAN_READABLE_TITLE_OF_CONTEXT >>`: Replace with the context title.
*   `## Purpose / How to Use 🎯`: **Crucial section.** Explain what the context is for and provide explicit instructions to the AI on how and when to use it.
*   `## Content / Information 📝`: Provide the actual context (rules, definitions, examples, explanations) using clear Markdown formatting. Use subheadings (`###`) for structure.
*   `## Key Points / Summary 💡 (Optional)`: Summarize the most critical information for quick AI reference.