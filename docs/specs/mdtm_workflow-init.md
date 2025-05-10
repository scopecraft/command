+++
# --- Basic Metadata ---
id = "RULE-MDTM-WORKFLOW-INIT-V1"
title = "Standard MDTM Task Creation & Delegation Workflow"
context_type = "rules"
scope = "Creating and delegating tasks via the TOML-based MDTM system"
target_audience = ["roo-commander", "prime-coordinator", "lead-*", "manager-project", "all"] # Target coordinators, leads, and specialists (for the update part)a
granularity = "procedure"
status = "active"
last_updated = "2025-04-22" # Use current date
tags = ["mdtm", "toml", "workflow", "delegation", "task-creation", "coordination", "rules"]
related_context = [
    ".roo/rules/01-standard-toml-md-format.md",
    ".roo/rules/12-logging-procedure-rule.md",
    ".ruru/tasks/",
    ".ruru/templates/toml-md/",
    ".ruru/docs/standards/mdtm_standard.md" # General MDTM standard (might need updating for TOML emphasis)
    ]
template_schema_doc = ".ruru/templates/toml-md/16_ai_rule.README.md"
relevance = "High: Defines core task delegation process"
+++

# Mandatory Rule: MDTM Task Creation & Delegation Workflow

This rule defines the standard procedure for creating Markdown-Driven Task Management (MDTM) task files (using TOML frontmatter) and delegating work to specialist modes when detailed tracking is required.

**Applies To:** `roo-commander`, `prime-coordinator`, `lead-*` modes (for initiating MDTM tasks), and `manager-project`. Also relevant for specialist modes receiving MDTM tasks.

**1. When to Use MDTM:**

*   Initiate this MDTM workflow (instead of simple `new_task` delegation) for tasks that meet criteria such as:
    *   Complexity (multi-step, involves dependencies).
    *   Requires detailed progress tracking or auditing.
    *   High-risk changes (core logic, infrastructure, security).
    *   Requires clear handoffs between specialists.
*   Refer to specific mode documentation (e.g., `roo-commander` KB `04-delegation-mdtm.md`) for detailed criteria if available. If unsure, **err on the side of using MDTM** for better tracking.

**2. Procedure for Initiator (Coordinator/Lead/Manager):**

1.  **Generate Task ID:** Create a unique task ID following the convention `TASK-[MODE_PREFIX]-[YYYYMMDD-HHMMSS]` (e.g., `TASK-REACT-20250422-140500`).
2.  **Select Template:** Choose the appropriate MDTM template from `.ruru/templates/toml-md/` (e.g., `01_mdtm_feature.md`, `02_mdtm_bug.md`).
3.  **Determine Path:** Construct the full path for the new task file within the `.ruru/tasks/` structure (e.g., `.ruru/tasks/FEATURE_Login/TASK-REACT-20250422-140500.md`).
4.  **Prepare Content:**
    *   **TOML Frontmatter:** Populate the `+++` block with essential metadata, adhering strictly to TOML syntax (Rule `01-standard-toml-md-format.md`). Include at minimum:
        *   `id`: The generated Task ID.
        *   `title`: Clear, concise task title.
        *   `status`: Set initially to `"🟡 To Do"` (or `"Pending"`).
        *   `type`: The appropriate task type (e.g., `"🌟 Feature"`, `"🐞 Bug"`).
        *   `assigned_to`: The slug of the target specialist mode (e.g., `"dev-react"`).
        *   `coordinator`: Your own mode's Task ID (e.g., `"TASK-CMD-..."`).
        *   `related_docs`: List paths to requirements, specs, etc.
        *   `tags`: Relevant keywords.
    *   **Markdown Body:** Fill in the Markdown sections (Description, Acceptance Criteria, Checklist). Define clear, actionable checklist items (`- [ ] Step description`).
5.  **Create Task File:** Use the `write_to_file` tool to create the MDTM task file at the determined path with the prepared TOML and Markdown content.
6.  **Log Creation:** Log the creation of the task file (including its path) according to standard logging procedures (Rule `12`).
7.  **Delegate via `new_task`:**
    *   Target the specialist mode specified in the `assigned_to` field.
    *   The `<message>` **MUST** clearly state: "Process MDTM task file: [Full path to the created .md file]". Include the Coordinator's Task ID for reference.
    *   Provide any *essential* immediate context if needed, but the primary instructions reside within the task file.
8.  **Update Initiator State:** Note that delegation has occurred. Await `attempt_completion` from the specialist. **Do not assume the task is being worked on in the background.**

**3. Responsibility of Assigned Specialist Mode:**

*   When receiving a `new_task` instruction referencing an MDTM task file:
    1.  **MUST** use `read_file` to load the content of the specified task file path.
    2.  **MUST** perform the work described in the Markdown body, following the checklist items.
    3.  **MUST** update the Markdown checklist (`- [ ]` -> `- [✅]`) as steps are completed using `apply_diff` or `search_and_replace`. Add brief notes/logs to the Markdown body as needed.
    4.  **MUST** update the `status` field in the **TOML block** of the task file upon completion (`"🟢 Done"`) or if blocked (`"⚪ Blocked"`), along with the `updated_date`, using `apply_diff`.
    5.  **MUST** report the final outcome back to the Coordinator using `attempt_completion`, referencing the MDTM task file path.

**Failure to create the MDTM file before delegation, or failure by the specialist to update the assigned file, breaks the tracking process.** This workflow is essential for managing complex tasks within the Roo system.