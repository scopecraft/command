# TOML+Markdown (TOML MD) Templates

This directory contains standardized templates for various document types used within this workspace. These templates leverage the **TOML+Markdown (TOML MD)** format, combining structured TOML frontmatter for machine-readable metadata with flexible Markdown for human-readable content.

## Purpose & Rationale

The TOML MD format is used across the workspace (including but not limited to MDTM task files, ADRs, documentation, context sources, meeting notes, etc.) to achieve several key benefits:

1.  **Enhanced Machine Readability:** TOML frontmatter provides structured `key = value` metadata that is easily and reliably parsed by scripts, IDE extensions, reporting tools, and AI assistants. This allows for automation, filtering, validation, and more accurate context understanding by AI without needing to parse the entire Markdown body first. Unlike YAML, TOML's simpler syntax avoids common indentation errors.
2.  **Improved Human Readability:** The main body of the document uses standard Markdown (including GFM features like checklists), which is familiar, easy to write, and renders well in most environments.
3.  **Co-location & Context:** Storing documents like tasks, ADRs, and context sources directly within the Git repository keeps information close to the code and other artifacts it relates to. The TOML frontmatter (e.g., `related_docs`, `related_tasks`) and inline Markdown links provide rich contextual connections.
4.  **Consistency:** Using standardized templates ensures that documents of the same type have a consistent structure and metadata schema, making them easier to find, understand, and process programmatically.
5.  **Lifecycle Management:** TOML fields like `status`, `version`, `created_date`, `updated_date`, `last_reviewed`, and `owner` allow for tracking the state and history of documents directly within the file.
6.  **Precise AI Guidance:** Metadata fields like `context_type`, `target_audience`, and `granularity` in context source files help guide AI assistants on how and when to use specific information effectively.

## Usage Instructions

1.  **Identify Need:** Determine the type of document you need to create (e.g., a new feature task, an architecture decision, meeting notes).
2.  **Select Template:** Choose the appropriate template file from the list below that matches your document type.
3.  **Copy & Rename:** Copy the template file to the relevant directory in the workspace (e.g., copy `01_mdtm_feature.md` to `.tasks/FEATURE_XXX/NNN_➕_description.md`, copy `07_adr.md` to `.decisions/ADR-NNN_description.md`). Follow established naming conventions for the specific document type (e.g., MDTM naming convention).
4.  **Fill TOML Frontmatter:** Carefully fill in the required (`<< REQUIRED >>`) and relevant optional fields in the TOML block at the beginning of the file. Pay attention to data types (strings in quotes `""`, arrays in `[]`, dates as `"YYYY-MM-DD"`). Remove any placeholder comments like `<< ... >>`.
5.  **Write Markdown Body:** Replace the placeholder content in the Markdown section with your specific information, following the structure provided by the template's headings.
6.  **Commit:** Add and commit the new file to Git.

**Key Principles:**
*   **Consistency:** Adhere strictly to the TOML field names, data types, and standardized values (e.g., for `status`, `priority`, `type`) defined in the templates and supporting documentation (like the MDTM guide).
*   **Completeness:** Fill in required TOML fields accurately. Provide sufficient detail in the Markdown body.
*   **Updates:** Keep the `updated_date` field current when making significant changes. Maintain the accuracy of the `status` field.

## Available Templates

Templates are organized into subdirectories within `.ruru/templates/`:

*   **`.ruru/templates/toml-md/`**: Contains general-purpose TOML+MD templates for tasks, ADRs, documentation, simple SOPs, etc.
*   **`.ruru/templates/modes/`**: Contains templates and specifications specifically for defining Roo Commander modes (v7.1+).
*   **`.ruru/templates/workflows/`**: Contains templates for defining complex, multi-step workflows or detailed SOPs.

### General Templates (`.ruru/templates/toml-md/`)

*   **`00_boilerplate.md`**: A generic starting point with common metadata fields. See `00_boilerplate.README.md` for schema and usage details.
*   **`01_mdtm_feature.md`**: For defining and tracking new user-facing features (MDTM Task). See `01_mdtm_feature.README.md` for schema and usage details.
*   **`02_mdtm_bug.md`**: For reporting, tracking, and resolving bugs (MDTM Task). See `02_mdtm_bug.README.md` for schema and usage details.
*   **`03_mdtm_chore.md`**: For maintenance, refactoring, dependency updates, or other non-feature tasks (MDTM Task). See `03_mdtm_chore.README.md` for schema and usage details.
*   **`04_mdtm_documentation.md`**: For tasks specifically focused on writing or updating documentation (MDTM Task). See `04_mdtm_documentation.README.md` for schema and usage details.
*   **`05_mdtm_test.md`**: For tasks related to creating or improving tests (Unit, Integration, E2E, etc.) (MDTM Task). See `05_mdtm_test.README.md` for schema and usage details.
*   **`06_mdtm_spike.md`**: For time-boxed research, investigation, or feasibility studies (MDTM Task). See `06_mdtm_spike.README.md` for schema and usage details.
*   **`07_adr.md`**: For documenting significant Architecture Decision Records. Typically stored in `.ruru/decisions/`. See `07_adr.README.md` for schema and usage details.
*   **`08_ai_context_source.md`**: For creating structured context files intended primarily for AI consumption (e.g., rules, best practices, API specs). Typically stored in `.ruru/context/` or `.roo/context/`. See `08_ai_context_source.README.md` for schema and usage details.
*   **`09_documentation.md`**: For general project documentation, user guides, technical explanations, etc. Typically stored in `.ruru/docs/`. See `09_documentation.README.md` for schema and usage details.
*   **`10_guide_tutorial.md`**: For step-by-step how-to guides or tutorials. Typically stored in `.ruru/docs/guides/`. See `10_guide_tutorial.README.md` for schema and usage details.
*   **`11_meeting_notes.md`**: For recording minutes, decisions, and action items from meetings. Typically stored in `.ruru/docs/meetings/` or `notes/`. See `11_meeting_notes.README.md` for schema and usage details.
*   **`12_postmortem.md`**: For documenting incident reports and post-mortem analysis. Typically stored in `.ruru/docs/incidents/` or `.ruru/reports/incidents/`. See `12_postmortem.README.md` for schema and usage details.
*   **`13_release_notes.md`**: For documenting changes included in a software release. Typically stored in `.ruru/docs/releases/`. See `13_release_notes.README.md` for schema and usage details.
*   **`14_standard_guideline.md`**: For defining coding standards, style guides, or operational guidelines. Typically stored in `.ruru/docs/standards/`. See `14_standard_guideline.README.md` for schema and usage details.
*   **`15_sop.md`**: For defining *simple* Standard Operating Procedures. Typically stored in `.ruru/processes/` or `.ruru/docs/standards/`. See `15_sop.README.md` for schema and usage details. (For complex workflows, use the template in `.ruru/templates/workflows/`).
*   **`16_ai_rule.md`**: A minimalist template for defining rules intended for AI context injection (e.g., in `.roo/rules/`). See `16_ai_rule.README.md` for schema and usage details.

    *   **`17_feature_proposal.md`**: For defining and tracking feature planning proposals. Typically stored in `.ruru/planning/`. See `17_feature_proposal.README.md` for schema and usage details.
*   **`18_release_notes.md`**: Standard Release Notes/Changelog File. See `18_release_notes.README.md` for schema and usage details.
*   **`18_release_notes.md`**: Standard Release Notes/Changelog File. See `18_release_notes.README.md` for schema and usage details.

### Workflow Templates (`.ruru/templates/workflows/`)

*   **`00_workflow_boilerplate.md`**: A comprehensive boilerplate for defining complex, multi-agent workflows or detailed SOPs, including preconditions, postconditions, step-specific error handling, and validation tracking. Use this for documents intended for the `.ruru/workflows/` directory or complex processes in `.ruru/processes/`.

## Creating New Templates

If none of the existing templates fit your needs, you can create a new one:

1.  **Start with Boilerplate:** Copy `00_boilerplate.md` to a new file in this directory, using a descriptive name (e.g., `15_new_template_type.md`).
2.  **Define Purpose:** Clearly understand the specific type of document this new template will represent.
3.  **Customize TOML:**
    *   Review the common fields in the boilerplate. Keep those that are relevant.
    *   Add new TOML fields specific to your document type. Consider what metadata would be useful for searching, filtering, automation, or AI understanding.
    *   Clearly mark required fields vs. optional fields using comments (e.g., `# << REQUIRED_FIELD_DESCRIPTION >>`).
    *   Define allowed values for enum-like fields (e.g., `# Options: value1, value2, value3`).
4.  **Structure Markdown:**
    *   Define standard Markdown headings (`## Section Title`) for the key information required in this document type.
    *   Add placeholder text or instructions under each heading to guide the user.
    *   Include examples (e.g., code blocks, checklists) where appropriate.
5.  **Create Schema README:** Create a corresponding `[TemplateName].README.md` file (e.g., `15_new_template_type.README.md`) in the same directory. Document the purpose, TOML schema (fields, types, required/optional, descriptions), and Markdown structure of your new template. Link to it from the `template_schema_doc` field in the template's TOML.
6.  **Update Index README:** **Crucially**, update *this* README file (`.ruru/templates/toml-md/README.md`) to include your new template in the "Available Templates" list with a brief description and a link to its schema README.
7.  **Formal Schema (Optional but Recommended):** Consider formally documenting the schema using a dedicated schema language (e.g., JSON Schema, Cue) and storing it elsewhere (e.g., in `.ruru/docs/schemas/`).

**Example Boilerplate Structure (from `00_boilerplate.md`):**

```markdown
# TOML Frontmatter Starts Here (No Delimiters)
# --- Basic Metadata ---
id = ""               # << UNIQUE_IDENTIFIER (e.g., TYPE-SCOPE-NNN) >>
title = ""            # << HUMAN_READABLE_TITLE >>
status = "draft"      # << e.g., draft, active, published, deprecated, proposed, accepted, etc. >>
created_date = ""     # << YYYY-MM-DD >>
updated_date = ""     # << YYYY-MM-DD >>
version = "1.0"       # << Document content version or related software version >>
tags = []             # << LIST_RELEVANT_KEYWORDS >>

# --- Ownership & Context ---
# author = "🧑‍💻 User:Name" # Optional: Who created this?
# owner = "Team:Name"     # Optional: Who maintains this?
# related_docs = []     # Optional: List paths/URLs to related documents/specs
# related_tasks = []    # Optional: List related MDTM task IDs
# parent_doc = ""       # Optional: Path/ID of parent document for hierarchy

# --- Document Type Specific Fields ---
# Add fields specific to the type of document this template represents
# e.g., for a guide:
# difficulty = "beginner" # beginner, intermediate, advanced
# estimated_time = "~15 minutes"
# prerequisites = ["Basic knowledge of X"]
# learning_objectives = ["Understand Y", "Be able to Z"]

# --- AI Interaction Hints (Optional) ---
# context_type = "reference" # e.g., reference, tutorial, conceptual, best_practices
# target_audience = ["all"]  # e.g., ["react-specialist", "junior-developer"]
# granularity = "overview"   # e.g., overview, detailed, specific_example

# TOML Frontmatter Ends Before Markdown Body
# ==========================================

# << HUMAN_READABLE_TITLE >>

## Overview / Purpose 🎯

*   Briefly explain the purpose of this document.
*   What problem does it solve or what information does it provide?

## Content Section 1 📝

*   Use standard Markdown for content.
*   Employ headings, lists, code blocks, etc., as needed.

## Content Section 2 ✅

*   Use GFM checklists if applicable: `- [ ] Item 1`

## Diagrams / Visuals 📊 (Optional)

\`\`\`mermaid
graph TD
    A[Start] --> B(Process);
    B --> C{Decision};
    C -->|Yes| D[End];
    C -->|No| B;
\`\`\`

## Key Learnings / Summary 💡 (Optional)

*   Summarize important takeaways or discoveries.

## Related Links 🔗 (Optional)

*   [Link Text](URL or path)