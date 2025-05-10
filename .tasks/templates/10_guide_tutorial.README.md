# Documentation: Template `10_guide_tutorial.md`

## Purpose

This template is used for creating step-by-step guides or tutorials. These documents aim to teach a user how to perform a specific task or use a particular feature. They are typically stored in `.ruru/docs/guides/` or similar locations.

## Usage

1.  Copy `.ruru/templates/toml-md/10_guide_tutorial.md` to the appropriate documentation directory (e.g., `.ruru/docs/guides/`).
2.  Rename the file descriptively (e.g., `guide_git_branching.md`, `tutorial_setup_dev_env.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, paying attention to `difficulty`, `estimated_time`, `target_audience`, `prerequisites`, and `learning_objectives`.
4.  Replace the placeholder content in the Markdown body with clear, sequential steps, verification instructions, and optional troubleshooting tips.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier or slug for the guide.
    *   Example: `"GUIDE-GIT-BRANCH-001"`, `"tutorial-dev-setup"`

*   `title` (String, Required):
    *   The human-readable title of the guide or tutorial.

*   `status` (String, Required):
    *   The current status of the guide.
    *   Options: `"draft"`, `"published"`, `"needs_review"`, `"deprecated"`.

*   `difficulty` (String, Required):
    *   The estimated difficulty level for the target audience.
    *   Allowed values: `"beginner"`, `"intermediate"`, `"advanced"`.

*   `estimated_time` (String, Required):
    *   A rough estimate of how long it takes to complete the guide.
    *   Example: `"~15 minutes"`, `"1 hour"`, `"30-45 minutes"`

*   `target_audience` (Array of Strings, Required):
    *   Specifies the intended audience(s) for this guide.
    *   Example: `["new_developers"]`, `["qa_testers"]`, `["all"]`

*   `prerequisites` (Array of Strings, Required):
    *   Lists the knowledge, tools, or setup required before starting the guide. Be specific.
    *   Example: `["Git installed", "Basic command line knowledge", "Node.js v18+"]`

*   `learning_objectives` (Array of Strings, Required):
    *   Lists the key skills or knowledge the user will gain upon completion. Start with action verbs.
    *   Example: `["Understand the purpose of Git branches", "Be able to create, switch, and merge branches"]`

*   `related_tool_version` (String, Optional):
    *   The specific version(s) of the software or tool being taught, if applicable.
    *   Example: `"Git 2.x"`, `"React 18"`, `"Node.js v18+"`

*   `last_tested` (String, Required):
    *   The date the steps in the guide were last verified to work correctly, in `YYYY-MM-DD` format. Crucial for maintaining accuracy.

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/10_guide_tutorial.README.md"`

*   `owner` (String, Optional):
    *   The team or individual responsible for maintaining the accuracy of this guide.

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization. Include relevant technologies, concepts, and type.
    *   Example: `["git", "branching", "tutorial", "beginner", "setup", "guide"]`

*   `related_tasks` (Array of Strings, Optional):
    *   List of MDTM task IDs related to the creation or update of this guide.

*   `related_context` (Array of Strings, Optional):
    *   List of IDs or paths to related AI context source files or other documentation.

## Markdown Body

The section below the `+++` TOML block contains the structured guide content:

*   `# << HUMAN_READABLE_GUIDE_TITLE >>`: Replace with the guide title.
*   `**Difficulty:** | **Est. Time:** | **Last Tested:**`: Display key info from TOML.
*   `## Introduction / Goal 🎯`: Explain the guide's purpose, goal, audience, and prerequisites.
*   `## Prerequisites Checklist ✅ (Optional)`: A checklist for users to verify prerequisites.
*   `## Step 1: << Action Title >> 📝`, `## Step 2: << Action Title >> ➡️`, etc.: Provide clear, numbered, sequential instructions with explanations and code examples/commands.
*   `## Verification / Check Your Work ✅`: Explain how users can confirm they performed the steps correctly.
*   `## Troubleshooting / Common Issues ❓ (Optional)`: Address potential problems and solutions.
*   `## Summary / Next Steps 💡`: Recap accomplishments and suggest further actions or learning.
*   `## Related Links 🔗 (Optional)`: Link to relevant external resources or other guides.