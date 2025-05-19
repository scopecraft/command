# Documentation: Template `06_mdtm_spike.md`

## Purpose

This template is used for defining and tracking time-boxed research, investigation, or feasibility study tasks (often called "spikes") within the Markdown-Driven Task Management (MDTM) system. The goal is typically to answer a specific question, evaluate options, or reduce uncertainty before committing to a full implementation task.

## Usage

1.  Copy `.ruru/templates/toml-md/06_mdtm_spike.md` to the appropriate task directory (e.g., `.ruru/tasks/RESEARCH/` or `.ruru/tasks/FEATURE_XXX/`).
2.  Rename the file following MDTM conventions (e.g., `009_💡_evaluate_charting_libs.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, clearly stating the research question in the `title`. Consider setting a `timebox`.
4.  Replace the placeholder content in the Markdown body with specific details about the research goal, scope, acceptance criteria (what defines a completed investigation), and document findings/conclusions.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the task, often generated (e.g., "SPIKE-CHART-009").

*   `title` (String, Required):
    *   A concise question or goal for the research/spike.
    *   Example: `"Evaluate charting libraries for Vue"`, `"Investigate feasibility of using WebSockets for real-time updates"`

*   `status` (String, Required):
    *   The current status of the task.
    *   Standard MDTM values: `"🟡 To Do"`, `"🔵 In Progress"`, `"🟣 Review"`, `"🟢 Done"`, `"⚪ Blocked"`, `"🧊 Archived"`, `"🤖 Generating"`.

*   `type` (String, Fixed: `"💡 Spike/Research"`):
    *   Indicates the task type. Do not change this value for spike tasks.

*   `priority` (String, Required):
    *   The priority level of the research task.
    *   Options: `"🔥 Highest"`, `"🔼 High"`, `"▶️ Medium"`, `"🔽 Low"`, `"🧊 Lowest"`.

*   `created_date` (String, Required):
    *   The date the task was created, in `YYYY-MM-DD` format.

*   `updated_date` (String, Required):
    *   The date the task was last significantly updated, in `YYYY-MM-DD` format.

*   `due_date` (String, Optional):
    *   Target completion date in `YYYY-MM-DD` format. Often used in conjunction with `timebox`.

*   `timebox` (String, Optional):
    *   An explicit time limit for the investigation (e.g., "1 day", "4 hours", "1 week"). Helps prevent unbounded research.

*   `assigned_to` (String, Optional):
    *   Who is currently assigned to perform the research.
    *   Examples: `"🤖 AI:research-context-builder"`, `"🧑‍💻 User:SeniorDev"`, `"👥 Team:Architecture"`.

*   `reporter` (String, Optional):
    *   Who requested this research.

*   `parent_task` (String, Optional):
    *   Path or ID of the feature, bug, or chore task that prompted this research.

*   `depends_on` (Array of Strings, Optional):
    *   List of task IDs that must be completed before this research can start.

*   `related_docs` (Array of Strings, Optional):
    *   List relative paths or URLs to relevant existing documentation, external articles, or related feature specs.
    *   Example: `["TASK-FEAT-010", "https://vue-chartjs.org/"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and filtering. Include relevant technologies, concepts, or goals.
    *   Example: `["research", "spike", "evaluation", "feasibility", "vue", "charting", "websockets"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/06_mdtm_spike.README.md"`

*   `outcome` (String, Optional):
    *   A summary field to be filled upon completion, indicating the result.
    *   Example: `"recommend_tool_x"`, `"feasible"`, `"not_feasible_due_to_y"`, `"inconclusive_more_research_needed"`.

*   `recommendation` (String, Optional):
    *   The specific recommendation made based on the research (if applicable).

*   `evaluated_options` (Array of Strings, Optional):
    *   List of the primary tools, technologies, or approaches that were considered during the evaluation.

*   `ai_prompt_log` (String, Optional, Multiline):
    *   A multiline string (`"""..."""`) to log key prompts given to AI assistants during research.

*   `reviewed_by` (String, Optional):
    *   Who performed the review of the research findings (if applicable).

*   `key_learnings` (String, Optional, Multiline):
    *   A space to summarize important discoveries, challenges, or useful resources found.

## Markdown Body

The section below the `+++` TOML block contains the human-readable details:

*   `# << CONCISE RESEARCH QUESTION >>`: Replace with the research title/question.
*   `## Description ✍️`: Detail the research question, why it's needed, scope, and timebox (if any).
*   `## Acceptance Criteria (Definition of Done) ✅`: Define what constitutes a completed investigation (e.g., report generated, recommendation made).
*   `## Implementation Notes / Research Approach 📝`: (Optional) Outline the planned steps for the research.
*   `## Findings / Results 📊`: Document the findings, comparisons, PoC results, etc.
*   `## Recommendation / Conclusion 💡`: State the final answer/recommendation with justification.
*   `## AI Prompt Log 🤖 (Optional)`: Alternative space for logging AI interactions.
*   `## Review Notes 👀 (For Reviewer)`: Space for feedback on the research.
*   `## Key Learnings 💡 (Optional)`: Document insights gained.