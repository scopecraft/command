+++
# --- Basic Metadata ---
id = ""
title = ""
status = "draft"
created_date = ""
updated_date = ""
version = "1.0"
tags = ["sop", "workflow"]
template_schema_doc = ".ruru/templates/toml-md/15_sop.README.md" # Link to schema documentation

# --- Ownership & Context ---
# author = ""
owner = "Roo Commander"
# related_docs = []
# related_tasks = []

# --- SOP Specific Fields ---
objective = ""
scope = ""
roles = []

# --- AI Interaction Hints (Optional) ---
# context_type = "process_definition"
# target_audience = ["all"]
# granularity = "detailed"
+++

# << SOP_TITLE >>

## 1. Objective 🎯

*   << REQUIRED: State the goal >>

## 2. Scope Boundaries ↔️

*   << REQUIRED: Define what this applies to and what is out of scope >>

## 3. Roles & Responsibilities 👤

*   << REQUIRED: List roles from TOML and their responsibilities in this SOP >>
    *   **Role 1:** Responsibility A...
    *   **Role 2:** Responsibility C...

## 4. Reference Documents 📚

*   List essential specs, templates, guides.

## 5. Procedure Steps 🪜

*   << REQUIRED: Provide step-by-step description >>
*   For each step, specify: Role, Action(s), Inputs, Tools, Outputs, Decision Points, Context Requirements.

    ```
    **Example Step Format:**

    **Step X: [Action Name] (Responsible Role)**
    1.  **Action:** Describe.
    2.  **Inputs:** List.
    3.  **Tools:** Specify.
    4.  **Context:** Note required context.
    5.  **Outputs:** Describe result.
    6.  **Decision:** If [condition], go to Y, else Z.
    ```

## 6. Error Handling & Escalation ⚠️

*   Describe error handling.
*   Define escalation paths.

## 7. Validation (PAL) ✅

*   Reference PAL process.
*   Record validation steps.

## 8. Revision History Memento 📜 (Optional)

*   **v1.0 (YYYY-MM-DD):** Initial draft.
*   **v1.1 (YYYY-MM-DD):** Changes.