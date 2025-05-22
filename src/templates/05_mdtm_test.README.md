# Documentation: Template `05_mdtm_test.md`

## Purpose

This template is used for defining and tracking tasks related to creating, updating, or running tests (Unit, Integration, E2E, Performance, Security, etc.) within the Markdown-Driven Task Management (MDTM) system.

## Usage

1.  Copy `.ruru/templates/toml-md/05_mdtm_test.md` to the appropriate task directory (e.g., `.ruru/tasks/TESTING/` or `.ruru/tasks/FEATURE_XXX/`).
2.  Rename the file following MDTM conventions (e.g., `007_🧪_add_unit_tests_for_auth.md`).
3.  Fill in the TOML frontmatter fields according to the schema below.
4.  Replace the placeholder content in the Markdown body with specific details about the testing required, the scope, and acceptance criteria.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the task, often generated (e.g., "TEST-AUTH-007").

*   `title` (String, Required):
    *   A concise, human-readable description of the testing task.
    *   Example: `"Add Unit Tests for AuthService"`, `"Write E2E Test for Login Flow"`

*   `status` (String, Required):
    *   The current status of the task.
    *   Standard MDTM values: `"🟡 To Do"`, `"🔵 In Progress"`, `"🟣 Review"`, `"🟢 Done"`, `"⚪ Blocked"`, `"🧊 Archived"`, `"🤖 Generating"`.

*   `type` (String, Fixed: `"🧪 Test"`):
    *   Indicates the task type. Do not change this value for test tasks.

*   `priority` (String, Required):
    *   The priority level of the testing task.
    *   Options: `"🔥 Highest"`, `"🔼 High"`, `"▶️ Medium"`, `"🔽 Low"`, `"🧊 Lowest"`.

*   `created_date` (String, Required):
    *   The date the task was created, in `YYYY-MM-DD` format.

*   `updated_date` (String, Required):
    *   The date the task was last significantly updated, in `YYYY-MM-DD` format.

*   `due_date` (String, Optional):
    *   Target completion date in `YYYY-MM-DD` format.

*   `estimated_effort` (String, Optional):
    *   An estimate of the effort required (e.g., "S", "M", "L").

*   `assigned_to` (String, Optional):
    *   Who is currently assigned to work on the tests.
    *   Examples: `"🤖 AI:e2e-tester"`, `"🧑‍💻 User:QAEngineer"`, `"👥 Team:QA"`.

*   `reporter` (String, Optional):
    *   Who requested these tests.

*   `parent_task` (String, Optional):
    *   Path or ID of the feature, bug, or chore task these tests relate to.

*   `depends_on` (Array of Strings, Optional):
    *   List of task IDs (e.g., feature implementation) that must be completed before testing can start/finish.

*   `related_docs` (Array of Strings, Optional):
    *   List relative paths or URLs to relevant feature specifications, testing framework documentation, etc.
    *   Example: `["TASK-FEAT-001", "https://jestjs.io/docs/getting-started"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and filtering. Include relevant test types, features, or components.
    *   Example: `["unit-test", "e2e-test", "integration-test", "auth", "qa", "login"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/05_mdtm_test.README.md"`

*   `test_type` (String, Optional):
    *   Specifies the type of testing more granularly if needed.
    *   Example: `"unit"`, `"integration"`, `"e2e"`, `"performance"`, `"security"`, `"regression"`.

*   `test_framework` (String, Optional):
    *   The primary testing framework or tool being used.
    *   Example: `"jest"`, `"pytest"`, `"cypress"`, `"playwright"`, `"k6"`.

*   `ai_prompt_log` (String, Optional, Multiline):
    *   A multiline string (`"""..."""`) to log key prompts given to AI assistants for test generation.

*   `review_checklist` (Array of Strings, Optional):
    *   A predefined checklist for test reviewers.
    *   Example: `["[ ] Tests Written", "[ ] Tests Pass", "[ ] Covers Key Scenarios"]`

*   `reviewed_by` (String, Optional):
    *   Who performed the review (if applicable).

## Markdown Body

The section below the `+++` TOML block contains the human-readable details:

*   `# << CONCISE TEST TASK >>`: Replace with the task title.
*   `## Description ✍️`: Detail what needs testing, why, the type of test, and scope.
*   `## Acceptance Criteria ✅`: List specific criteria for considering the testing task complete (e.g., coverage goals, passing scenarios).
*   `## Implementation Notes / Test Scenarios 📝`: (Optional) List specific test cases or scenarios to implement.
*   `## AI Prompt Log 🤖 (Optional)`: Alternative space for logging AI interactions related to test generation.
*   `## Review Notes 👀 (For Reviewer)`: Space for feedback on the tests.