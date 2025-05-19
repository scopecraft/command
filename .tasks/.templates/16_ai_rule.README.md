# Documentation: Template `16_ai_rule.md`

## Purpose

This template defines the structure for creating AI rule files, typically stored in `.roo/rules/`. These files provide specific instructions or constraints to AI assistants. The template is designed to be minimalist to optimize token count when included in AI prompts.

## Usage

1.  Copy `.ruru/templates/toml-md/16_ai_rule.md` to the target location (e.g., `.roo/rules/NN-rule-name.md`).
2.  Fill in the TOML frontmatter fields according to the schema below.
3.  Replace the `# << RULE_CONTENT_GOES_HERE >>` placeholder in the Markdown body with the actual rule text, using standard Markdown formatting. Keep the rule text concise and focused.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for this specific rule document.
    *   Example: `"RULE-GIT-001"`, `"RULE-MDTM-002"`

*   `title` (String, Required):
    *   A human-readable title describing the rule.
    *   Example: `"Git Commit Message Format"`, `"MDTM Task File Naming Convention"`

*   `context_type` (String, Fixed: `"rules"`):
    *   Indicates the file's purpose is to define rules for AI behavior. Do not change this value.

*   `scope` (String, Required):
    *   Describes the specific area or process the rule applies to.
    *   Example: `"Git Commit Messages"`, `"MDTM Task File Format"`, `"Python Code Style"`

*   `target_audience` (Array of Strings, Required):
    *   Lists the AI modes or user roles this rule is intended for. Use `"all"` if it applies universally.
    *   Example: `["all"]`, `["git-manager", "code-reviewer"]`, `["python-developer"]`

*   `granularity` (String, Fixed: `"ruleset"`):
    *   Indicates the content represents a set of rules. Do not change this value.

*   `status` (String, Required):
    *   The current status of the rule.
    *   Allowed values: `"active"`, `"draft"`, `"deprecated"`.

*   `last_updated` (String, Required):
    *   The date the rule was last significantly updated, in `YYYY-MM-DD` format.

*   `version` (String, Optional):
    *   Version of the rule set itself or a related concept/tool it applies to.
    *   Example: `"1.1"`, `"Python 3.10"`

*   `related_context` (Array of Strings, Optional):
    *   List of IDs or file paths to other relevant context or rule files.
    *   Example: `["RULE-GIT-002", ".docs/standards/commit-guidelines.md"]`

*   `tags` (Array of Strings, Required):
    *   Keywords to aid searching and categorization.
    *   Example: `["git", "commit", "format", "rules"]`, `["mdtm", "tasks", "naming", "rules"]`

*   `relevance` (String, Optional):
    *   A hint for the AI about the importance or specific use case of the rule.
    *   Example: `"High relevance for commit generation"`, `"Critical for file creation"`

## Markdown Body

The section below the `+++` TOML block should contain the actual rule(s) defined using standard Markdown. This section should be kept concise and focused purely on the rule definition, avoiding general explanatory text which belongs in separate documentation files.