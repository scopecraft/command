+++
# --- Metadata ---
id = "TEMPLATE-PLAYBOOK-README-V1"
title = "README: Project Playbook Template (`22_playbook.md`)"
status = "published"
created_date = "2025-04-24"
updated_date = "2025-04-24"
version = "1.0"
tags = ["readme", "template", "documentation", "playbook", "guide", "project-management", "standard"]
related_docs = [
    ".ruru/templates/toml-md/22_playbook.md", # The template file itself
    ".ruru/docs/playbooks/README.md", # The index of existing playbooks
    ".ruru/docs/standards/project-management-strategy-v1.md" # The overall PM strategy
]
objective = "Explain the purpose, structure, and usage of the standard template (`22_playbook.md`) for creating new Roo Commander Project Playbooks."
scope = "Provides guidance for developers, project managers, or AI agents tasked with creating new playbook documents."
target_audience = ["Playbook Authors (Human & AI)", "System Maintainers"]
+++

# README: Project Playbook Template (`22_playbook.md`)

## 1. Purpose of This Template

This file (`.ruru/templates/toml-md/22_playbook.md`) serves as the standard template for creating new **Project Playbooks** within the Roo Commander ecosystem.

Playbooks are designed to:

*   Provide practical, step-by-step guidance for common project types or capability demonstrations.
*   Illustrate the application of the standard **Epic -> Feature -> Task** hierarchy (detailed in `project-management-strategy-v1.md`).
*   Offer reusable workflows and suggest appropriate AI mode delegations for specific scenarios.
*   Serve as valuable context for both human users planning projects and AI modes executing them.

Using this template ensures consistency in structure, metadata, and level of detail across all playbooks stored in `.ruru/docs/playbooks/`.

## 2. Template Structure Overview

The template follows the standard TOML+Markdown format used throughout this workspace:

*   **TOML Frontmatter (`+++` block):** Contains essential metadata about the playbook itself (ID, title, status, tags, related documents, objectives, scope, etc.). This allows for programmatic understanding and indexing.
*   **Markdown Body:** Contains the human-readable content, structured into logical phases and steps:
    *   **Title:** Mirrored from the frontmatter.
    *   **Scenario:** A clear description of the situation the playbook addresses.
    *   **Phases:** High-level stages of the workflow (e.g., Planning, Implementation, Testing).
    *   **Steps:** Numbered steps within each phase detailing goals, actions, responsible roles/modes, tools, inputs, outputs, and error handling where applicable.
    *   **Key Considerations:** Specific advice, potential pitfalls, or important factors related to the playbook's scenario.

## 3. How to Use This Template to Create a New Playbook

1.  **Copy the Template:** Duplicate the file `.ruru/templates/toml-md/22_playbook.md` into the `.ruru/docs/playbooks/` directory.
2.  **Rename the File:** Rename the copied file using the convention `[NN]-playbook-[brief-scenario-name].md`, where `[NN]` is the next sequential number in the directory (e.g., `26-playbook-setup-django-api.md`). Use lowercase and hyphens.
3.  **Update TOML Frontmatter:**
    *   **CRITICAL:** Change the `id` to be unique (e.g., `PLAYBOOK-SETUP-DJANGO-API-V1`).
    *   **CRITICAL:** Update the `title` to accurately reflect the playbook's purpose.
    *   Update `status` from "draft" to "published" when ready.
    *   Update `created_date` and `updated_date`.
    *   Add relevant `tags` specific to the playbook's content (e.g., `django`, `backend`, `api`, `setup`).
    *   Add `related_docs` pointing to key modes, standards, or other playbooks relevant to this scenario.
    *   Clearly define the `objective`, `scope`, `target_audience`, and `example_project_type`.
4.  **Define the Scenario:** Write a concise, clear description of the starting point and the goal addressed by this playbook in the "Scenario" section.
5.  **Customize Phases and Steps:**
    *   Adapt the suggested phase names (`Phase 1: ...`, `Phase 2: ...`) to suit the specific workflow.
    *   For each step:
        *   Define a clear **Goal**.
        *   Describe the **Action** required.
        *   Specify **Tools** to be used (e.g., `ask_followup_question`, `execute_command`, `read_file`, `write_to_file`, `new_task`).
        *   Indicate **Delegation** targets (e.g., `manager-product`, `dev-api`, `util-writer`, `core-architect`, `agent-research`, `test-e2e`).
        *   List example **Tasks** that would typically be created under this step, using the MDTM format where applicable.
        *   Describe expected **Outputs** and basic **Error Handling**.
    *   Add, remove, or modify steps to accurately represent the best practice for the scenario.
6.  **Add Key Considerations:** Fill in the "Key Considerations" section with specific advice, common pitfalls, or important factors unique to this playbook's topic (e.g., security for auth, testing for refactoring, API key handling for integrations).
7.  **Review:** Read through the completed playbook for clarity, logical flow, accuracy, and consistency. Ensure it aligns with the overall project management strategy.
8.  **Update Playbook Index:** **Crucially**, edit the main playbook README (`.ruru/docs/playbooks/README.md`) and add an entry for your new playbook in Section 4, including its filename, ID, title, and summary.

## 4. Key Template Fields Explained

*   **`id`:** Unique identifier for the playbook document.
*   **`title`:** Human-readable title describing the playbook.
*   **`tags`:** Keywords for searching and categorization. Include relevant technologies, concepts, and phases.
*   **`related_docs`:** Links to essential standards, modes, or other playbooks needed to understand or execute this one.
*   **`objective`:** A concise statement of what completing this playbook achieves.
*   **`scope`:** Defines the boundaries – what is included and excluded.
*   **`example_project_type`:** Helps categorize the playbook's applicability.

## 5. Markdown Body Structure Guidance

*   **Phases:** Break down the process into logical, high-level stages.
*   **Steps:** Within each phase, detail concrete actions.
*   **Goals/Actions/Tasks:** Clearly define the *why*, *what*, and *how* for each step.
*   **Delegation:** Be specific about which AI mode is typically responsible for executing a task.
*   **Examples:** Provide concrete examples of tasks, commands, or configuration snippets where appropriate.
*   **Key Considerations:** Offer practical advice and warnings specific to the scenario.

## 6. Best Practices for Writing Playbooks

*   **Be Specific:** Avoid vague instructions. Detail commands, prompts, and expected outcomes.
*   **Be Practical:** Focus on realistic workflows and common challenges.
*   **Be Consistent:** Follow the template structure and formatting guidelines.
*   **Think Like the AI:** Structure information logically for AI processing. Clearly link steps and artifacts.
*   **Iterate:** Treat playbooks as living documents; refine them as best practices evolve.

By using this template consistently, we can build a valuable library of project playbooks that enhance the effectiveness and predictability of working with Roo Commander.