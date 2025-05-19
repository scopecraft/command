+++
# --- Metadata ---
# !! IMPORTANT: Replace placeholders below !!
id = "PLAYBOOK-[BRIEF-NAME]-V1" # e.g., PLAYBOOK-SETUP-DJANGO-API-V1
title = "Project Playbook: [Concise Title Describing Scenario]" # e.g., Project Playbook: Setup Django REST API Backend
status = "draft" # Start as draft
created_date = "[YYYY-MM-DD]" # Use current date
updated_date = "[YYYY-MM-DD]" # Use current date
version = "1.0"
tags = ["playbook", "documentation", "project-management", "[primary-topic]", "[secondary-topic]", "epic", "feature", "task"] # Add specific tags like 'setup', 'refactor', 'backend', 'frontend', 'api', 'demo', etc.
related_docs = [
    ".ruru/docs/standards/project-management-strategy-v1.md",
    ".ruru/planning/project-structure/00-epic-feature-task-plan.md",
    # Add links to key related modes (e.g., framework specialist, lead)
    # ".ruru/modes/framework-django/framework-django.mode.md",
    # ".ruru/modes/lead-backend/lead-backend.mode.md"
]
objective = "Provide a structured process for [Action being guided, e.g., setting up, implementing, refactoring, demonstrating] a [Type of project/feature] using [Key technologies/modes] via the Roo Commander Epic-Feature-Task hierarchy."
scope = "Covers [Briefly list phases/key activities covered, e.g., planning, implementation, testing] for this specific scenario."
target_audience = ["Users", "Developers", "[Other relevant roles, e.g., Designers, DevOps]", "AI Modes"]
# --- Document Specific Fields ---
example_project_type = "[Category of project, e.g., New Backend API, Existing Frontend Feature Enhancement, AI Capability Demo]"
# [Add any other specific placeholder variables relevant to this template type if needed]
+++

# Project Playbook: [Concise Title Describing Scenario]

This playbook outlines a recommended approach for [Action being guided] related to [Type of project/feature], using Roo Commander's Epic-Feature-Task hierarchy.

**Scenario:** [Clearly describe the starting situation and the high-level goal the user wants to achieve. Be specific.]
*   *Example:* You have an existing Next.js application and need to add a new authenticated API route to fetch user profile data.
*   *Example:* You want to build a proof-of-concept demonstrating real-time collaboration using WebSockets.

## Phase 1: [Phase Name, e.g., Planning & Design / Setup / Analysis]

*(Describe the initial goals and steps for this phase)*

1.  **Define the Goal (Epic/Feature):**
    *   **Goal:** [Specific objective for this step, e.g., Establish the high-level requirements].
    *   **Action:** [How to achieve it, e.g., Create the main Epic/Feature artifact]. Specify example path/ID format.
    *   **Content:** [Describe key information needed in the artifact's TOML/Markdown]. Set initial `status`.

2.  **[Next Step Title, e.g., Technology Selection / Prerequisite Check / Initial Setup]:**
    *   **Goal:** [Objective of this step].
    *   **Action:** [How to achieve it, e.g., Delegate research/analysis, define as Feature, run commands]. Specify target modes or commands.
    *   **Tasks (Examples):** [List specific, granular tasks needed. Indicate delegation target.]
        *   "Task description." (Delegate to `[mode-slug]`)
        *   "Run command `[command text]`." (Via `execute_command`)
    *   **Output:** [Expected outcome of this step, e.g., ADR created, baseline measured, project structure initialized].

3.  **(Add more steps as needed for this phase)**

## Phase 2: [Phase Name, e.g., Implementation / Development / Execution]

*(Describe the core implementation goals and steps. This phase is often iterative, especially per Feature or component.)*

*(Structure commonly involves defining a Feature, then decomposing it into Tasks)*

1.  **Define [Component/Module/Operation] (Feature):**
    *   **Goal:** [Objective for this specific part of the implementation].
    *   **Action:** Create Feature artifact (`FEAT-...`). Link to parent Epic. Set `status` to "Ready for Dev".
    *   **Content:** Define `description`, `acceptance_criteria`.

2.  **Implement [Component/Module/Operation] (Tasks):**
    *   **Goal:** [Objective for the task implementation].
    *   **Action:** Decompose Feature into specific technical Tasks.
    *   **Tasks (Examples):** [List specific, granular implementation tasks.]
        *   "Implement function `[functionName]` in `[file path]`." (Delegate to `[mode-slug]`)
        *   "Create UI component `[ComponentName]`." (Delegate to `[mode-slug]`)
        *   "Write unit tests for `[module]`." (Delegate to `test-*` or `[mode-slug]`)
    *   **Process:** Use MDTM workflow, link tasks to Feature. Emphasize reading existing code, testing.

3.  **(Repeat steps 1-2 for other major components/operations in this phase)**

## Phase 3: [Phase Name, e.g., Testing & Verification / Integration / Refinement]

*(Describe the steps needed to ensure quality, integration, and polish.)*

1.  **[Testing Type, e.g., Integration Testing / E2E Testing]:**
    *   **Goal:** [Objective of the testing].
    *   **Action:** Define Feature/Tasks for testing. Delegate to `test-*` modes.
    *   **Process:** Describe the scope of testing.

2.  **[Refinement Activity, e.g., Code Review / Performance Tuning / Styling Polish]:**
    *   **Goal:** [Objective of the refinement].
    *   **Action:** Delegate to relevant modes (`util-reviewer`, `util-performance`, `design-*`).
    *   **Process:** Describe the review/tuning process.

3.  **(Add more steps as needed)**

## Phase 4: [Phase Name, e.g., Documentation & Completion / Release Prep]

1.  **Documentation:**
    *   **Goal:** [Objective for documentation].
    *   **Action:** Define Task(s). Delegate to `util-writer`.
    *   **Content:** Specify what needs documenting (README, internal guides, API docs).

2.  **Final Review & Completion:**
    *   **Action:** Review overall result. Mark Features/Epic as "Done". Inform user.

## Key Considerations for [Type of Project]:

*   **[Consideration 1]:** [Highlight critical aspect, e.g., Security for Auth, Testing for Refactoring, API Design for CRUD].
*   **[Consideration 2]:** [e.g., Prerequisite tools/knowledge].
*   **[Consideration 3]:** [e.g., Common pitfalls or trade-offs].
*   **(Add more specific considerations)**

This playbook provides a framework for [Action being guided]. Adapt the specific Features, Tasks, and considerations based on the project's unique requirements. Remember to maintain clear links between Epics, Features, and Tasks using their respective IDs.