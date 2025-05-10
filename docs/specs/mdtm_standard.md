# 🛠️ Implementing MDTM - Feature Structure: A Practical Guide

**Version:** 1.0
**Date:** 2025-04-05

This document provides the detailed conventions, structures, and templates for implementing **Markdown-Driven Task Management (MDTM) - Feature Structure** within your project. Adhering to these guidelines ensures consistency, maximizes clarity for both humans 🧑‍💻 and AI assistants 🤖, and enables effective task tracking directly within your codebase.

## 1. 🗂️ Directory Structure Conventions

Organize all tasks within a top-level `tasks/` directory. Use subdirectories to group tasks by feature, epic, or major component.

```
PROJECT_ROOT/
├── src/                     # Source Code
├── docs/                    # Project Documentation (PRDs, Specs)
├── tasks/                   # 👈 **Main MDTM Directory**
│   ├── _templates/          # 📄 Optional: Standard task templates
│   │   ├── 🌟_feature.md
│   │   ├── 🐞_bug.md
│   │   ├── 🧹_chore.md
│   │   └── 📖_documentation.md
│   │
│   ├── FEATURE_authentication/  # 🔑 Feature: Authentication
│   │   ├── _overview.md       # 🗺️ Optional: Feature summary/epic description
│   │   ├── 001_➕_login_ui.md   # ✨ Task: Implement Login UI
│   │   ├── 002_⚙️_login_logic.md # ✨ Task: Implement Login Logic API Call
│   │   └── 003_🔑_password_reset.md # ✨ Task: Password Reset Flow
│   │
│   ├── FEATURE_user_profile/  # 👤 Feature: User Profile
│   │   ├── _overview.md       # 🗺️ Optional: Feature summary
│   │   └── 004_🖼️_display_data.md # ✨ Task: Display User Profile Data
│   │
│   ├── AREA_refactoring/        # 🧹 Area: Code Refactoring
│   │   └── 005_🧹_refactor_auth_service.md # ✨ Task: Refactor Auth Service
│   │
│   └── AREA_bugs/               # 🐞 Area: Bug Tracking
│       └── 006_🐞_login_fails_safari.md # ✨ Task: Bug Fix
│
├── archive/                 # 📦 Optional: Completed/Closed tasks (mirrors `tasks/` structure)
│   └── ...
└── README.md
```

**Key Points:**
*   **Top-Level:** Always use a root `tasks/` directory.
*   **Feature Folders:** Prefix feature/component folders clearly (e.g., `FEATURE_authentication`, `AREA_backend_api`). Use ALL_CAPS prefixes for easy identification.
*   **Overview Files (`_overview.md`):** Optional but recommended for each feature folder. Acts as an Epic description, linking to child tasks. Use a leading underscore (`_`).
*   **Templates Folder (`_templates/`):** Optional but recommended. Prefix template files with an emoji and underscore (e.g., `🌟_feature.md`).
*   **Archive Folder (`archive/`):** Optional. If used, maintain the same feature folder structure within it for historical organization.

## 2. 📄 Task File Naming Conventions

Consistency in naming makes tasks easier to find and reference.

**Format:** `NNN_➕_short_description.md`

*   **`NNN`:** A three-digit sequence number (e.g., `001`, `002`, `045`). This helps with ordering and provides a simple unique reference within a feature context. *Reset sequence for each major feature folder if desired, or use project-wide sequencing.*
*   **`_➕_`:** An emoji representing the task **type** (see Type Emojis below) enclosed in underscores. Provides immediate visual classification.
*   **`short_description`:** A brief, lowercase, underscore-separated description of the task (e.g., `login_ui`, `refactor_api_service`, `fix_null_pointer`). Keep it concise.
*   **`.md`:** Standard Markdown extension.

**Examples:**
*   `001_➕_login_ui.md` (New Feature task)
*   `006_🐞_fix_null_pointer.md` (Bug Fix task)
*   `015_🧹_optimize_database_query.md` (Chore/Refactor task)
*   `021_📖_update_readme.md` (Documentation task)

## 3. ⚙️ YAML Front Matter: The Task's Brain

This is the structured core of each task file. Use the following fields consistently.

```yaml
---
# 🆔 Task Identification & Core Metadata (Required)
id:             # REQUIRED. Unique ID (e.g., FEAT-AUTH-001, BUG-123). Convention: {TYPE_PREFIX}-{FEATURE_NAME_ABBR}-{NNN}
title:          # REQUIRED. Human-readable title (String). "Implement Login UI (Vue)"
status:         # REQUIRED. Current workflow state (String, from standard list). See Statuses below. "🟡 To Do"
type:           # REQUIRED. Category of work (String, from standard list). See Types below. "🌟 Feature"

# ⏳ Scheduling & Effort (Recommended)
priority:       # Recommended. Task importance (String, from standard list). See Priorities below. "🔼 High"
created_date:   # Recommended. Date created (YYYY-MM-DD). "2025-04-05"
updated_date:   # Recommended. Date last modified (YYYY-MM-DD). "2025-04-05"
due_date:       # Optional. Target completion date (YYYY-MM-DD). "2025-04-12"
estimated_effort: # Optional. Size estimate (String/Number). E.g., "M", "L", "3", "5" (Points or T-Shirt Size)

# 🧑‍💻 Assignment & Responsibility (Recommended)
assigned_to:    # Recommended. Who tackles the next action (String). "🤖 AI", "🧑‍💻 User:Alice", "👥 Team:Frontend"
reporter:       # Optional. Who created/reported the task (String). "🧑‍💻 User:Bob" (Especially for Bugs)

# 🔗 Relationships & Context (Crucial for Context)
parent_task:    # Optional. Path/ID of parent feature/epic (String). "FEATURE_authentication/_overview.md"
depends_on:     # Optional. List of task IDs this waits for (List of Strings). ["FEAT-AUTH-002"]
related_docs:   # Optional. Links to external docs/sections (List of Strings). ["docs/PRD.md#login-reqs", "docs/API.md#auth"]
tags:           # Optional. Keywords for filtering (List of Strings). ["ui", "vue", "auth", "critical"]

# 🤖 AI & Review Specific Fields (Optional)
ai_prompt_log:  # Optional. Log of key prompts used (List of Strings or multiline string). ["Generate component X...", "Refine Y..."]
review_checklist: # Optional. Standard review checks (List of Strings - use Markdown checkboxes). ["[ ] Code Style", "[ ] Tests Pass"]
reviewed_by:    # Optional. Who reviewed the task (String). "🧑‍💻 User:Charlie"
---

# Title matching YAML title (optional redundancy)
## Description ✍️
... Markdown Body ...
```

**Emoji Conventions for Fields:**
*   🆔 Identification
*   ⏳ Scheduling/Effort
*   🧑‍💻 Assignment
*   🔗 Relationships/Context
*   🤖 AI/Review

## 4. 🏷️ Standardized Field Values & Emojis

Use these standard values for consistency. Emojis provide quick visual cues.

### Statuses (`status:` field)

*   `⚪ Blocked`: 🚧 Cannot proceed (explain why in body).
*   `🟡 To Do`: 📥 Ready to be started.
*   `🔵 In Progress`: 🏗️ Actively being worked on (human).
*   `🤖 Generating`: ✨ AI actively generating code/content.
*   `🟣 Review`: 👀 Output needs human review.
*   `🧪 Testing`: 🔬 Passed review, undergoing tests.
*   `🟢 Done`: ✅ Completed, verified, merged.

### Types (`type:` field) & File Name Emojis

*   `🌟 Feature`: (`_➕_`) New user-facing functionality.
*   `🐞 Bug`: (`_🐞_`) Fixing incorrect behavior.
*   `🧹 Chore`: (`_🧹_`) Maintenance, refactoring, updates, non-visible improvements.
*   `📖 Documentation`: (`_📖_`) Writing or updating docs.
*   `🧪 Test`: (`_🧪_`) Creating or improving tests.
*   `🎨 UI/UX`: (`_🎨_`) Design or user experience improvements.
*   `💡 Spike/Research`: (`_💡_`) Investigation or technical exploration.
*   `🗺️ Epic/Overview`: (`_🗺️_`) High-level feature summary file (`_overview.md`).

### Priorities (`priority:` field)

*   `🔥 Highest`: Must be done immediately.
*   `🔼 High`: Important, tackle soon.
*   `▶️ Medium`: Normal priority.
*   `🔽 Low`: Can wait, optional.
*   `🧊 Lowest`: Icebox, do if time permits.

## 5. 📝 Markdown Body Conventions

Use the body for human-readable details and collaboration.

*   **Title:** Optionally repeat the `title` from YAML as a top-level heading (`#`).
*   **Description (`## Description ✍️`):** Clearly explain the *what* and *why* of the task. Provide background context.
*   **Acceptance Criteria (`## Acceptance Criteria ✅`):** **CRUCIAL.** Use Markdown checklists (`- [ ]`). Each item should be specific, measurable, achievable, relevant, and testable (SMART-ish).
    *   `- [ ] User can enter username.`
    *   `- [ ] Password field masks input.`
    *   `- [x]` *Check when done.*
*   **Implementation Notes / Sub-Tasks (`## Implementation Notes / Sub-Tasks 📝`):** Optional. Breakdown steps, technical details, considerations. Can also use checklists here.
*   **Diagrams (`## Diagrams 📊`):** Embed Mermaid diagrams for workflows, state, etc.
    ```mermaid
    graph TD
        A[ToDo] --> B{Generating};
        B --> C[Review];
        C -- Changes Needed --> B;
        C -- OK --> D[Testing];
        D --> E((Done));
    ```
*   **AI Prompts Used (`## AI Prompt Log 🤖`):** Optional but recommended for traceability. Log key prompts.
    ```prompt
    Generate a Vue component for... based on AC in this file and docs/PRD.md#login-reqs
    ```
*   **Review Comments (`## Review Notes 👀`):** Space for reviewers to leave feedback.

## 6. 📄 Example Templates

Use these as starting points (place in `tasks/_templates/`).

### `🌟_feature.md`

```markdown
---
# 🆔 Task Identification & Core Metadata
id:             # << GENERATE_UNIQUE_ID (e.g., FEAT-XXX-NNN) >>
title:          # << CONCISE FEATURE TITLE >>
status:         "🟡 To Do"
type:           "🌟 Feature"

# ⏳ Scheduling & Effort
priority:       "▶️ Medium"
created_date:   # << YYYY-MM-DD >>
updated_date:   # << YYYY-MM-DD >>
due_date:       # Optional
estimated_effort: # Optional (e.g., "M")

# 🧑‍💻 Assignment & Responsibility
assigned_to:    # Optional (e.g., "🤖 AI", "🧑‍💻 User:Name")
reporter:       # Optional

# 🔗 Relationships & Context
parent_task:    # Optional (Path to _overview.md)
depends_on:     [] # Optional (List of task IDs)
related_docs:   [] # << LIST PATHS TO PRD, DESIGNS, SPECS >>
tags:           [] # << LIST KEYWORDS >>

# 🤖 AI & Review Specific Fields
ai_prompt_log:  []
review_checklist: ["[ ] Meets all AC", "[ ] Code Style OK", "[ ] Tests Added/Pass"]
reviewed_by:    # Optional
---

# << CONCISE FEATURE TITLE >>

## Description ✍️
*   What is this feature?
*   Why is it needed? (User value, business goal)
*   Link to high-level design/mockups if available.

## Acceptance Criteria ✅
*   - [ ] Criterion 1 (Specific, Testable)
*   - [ ] Criterion 2
*   - [ ] ...

## Implementation Notes / Sub-Tasks 📝
*   (Optional technical details or breakdown)

## AI Prompt Log 🤖
*   (Log key prompts here)
```

### `🐞_bug.md`

```markdown
---
# 🆔 Task Identification & Core Metadata
id:             # << GENERATE_UNIQUE_ID (e.g., BUG-NNN) >>
title:          # << CONCISE BUG DESCRIPTION >>
status:         "🟡 To Do"
type:           "🐞 Bug"

# ⏳ Scheduling & Effort
priority:       "🔼 High" # Default higher for bugs
created_date:   # << YYYY-MM-DD >>
updated_date:   # << YYYY-MM-DD >>
due_date:       # Optional
estimated_effort: # Optional

# 🧑‍💻 Assignment & Responsibility
assigned_to:    # Optional
reporter:       # << WHO FOUND THE BUG? (e.g., "🧑‍💻 User:Name", "QA") >>

# 🔗 Relationships & Context
parent_task:    # Optional (Related feature?)
depends_on:     []
related_docs:   [] # Links to error logs, screenshots?
tags:           ["bug"] # << Add relevant feature tags >>

# 🤖 AI & Review Specific Fields
ai_prompt_log:  []
review_checklist: ["[ ] Bug is fixed", "[ ] Regression test added", "[ ] Code Style OK"]
reviewed_by:    # Optional
---

# << CONCISE BUG DESCRIPTION >>

## Description ✍️
*   **What happened?** (Detailed description of the bug)
*   **Expected behavior?**
*   **Actual behavior?**

## Steps to Reproduce 👣
1.  Go to '...'
2.  Click on '....'
3.  Scroll down to '....'
4.  See error / incorrect behavior

## Environment 🖥️
*   Browser: (e.g., Chrome 110, Safari 16)
*   OS: (e.g., macOS Ventura, Windows 11)
*   Device: (e.g., Desktop, iPhone 14)
*   User role (if applicable):

## Acceptance Criteria ✅
*   - [ ] The bug described above no longer occurs following the steps to reproduce.
*   - [ ] Expected behavior is observed.
*   - [ ] A regression test covering this scenario is added and passes.

## Implementation Notes / Analysis 📝
*   (Root cause analysis, proposed fix)

## AI Prompt Log 🤖
*   (Log prompts used for analysis or fix generation)
```

*(Create similar templates for `🧹_chore.md`, `📖_documentation.md`, etc.)*

## 7. 🔗 Linking Conventions

*   **`parent_task:`** Use the relative path to the `_overview.md` file for the feature/epic this task belongs to.
*   **`depends_on:`** List the full Task `id` strings (from YAML) of tasks that *must* be `🟢 Done` before this one can start.
*   **`related_docs:`** Use relative paths from the project root to specific documents or use `#section-links` if the document format supports it (like Markdown).
*   **Inline Links:** Use standard Markdown links (`[text](path/to/file)`) within the description or notes to reference other tasks, code files, or external URLs.

## 8. 🌊 Example Workflow Progression

Task `tasks/FEATURE_authentication/001_➕_login_ui.md`:

1.  **Creation:**
    *   File created.
    *   `status: 🟡 To Do`
    *   `assigned_to: 🤖 AI`
    *   YAML filled, Description & AC written. Commit.
2.  **AI Generation:**
    *   User prompts AI referencing the task ID.
    *   AI works...
    *   AI (or user via IDE) updates `status: 🟣 Review`. Adds generated code file paths to notes. Commit.
3.  **Review:**
    *   `assigned_to: 🧑‍💻 User:Alice`
    *   Alice reviews, checks AC (`- [x]`), adds comments in Review Notes.
    *   If OK -> updates `status: 🧪 Testing`. Commit.
    *   If Not OK -> updates `status: 🔵 In Progress`, `assigned_to: 🤖 AI` (or human), adds feedback for rework. Commit.
4.  **Testing:**
    *   Automated/manual tests run.
    *   If Pass -> updates `status: 🟢 Done`. Commit.
    *   If Fail -> updates `status: 🐞 Bug` (or revert to `In Progress`), adds details. Commit.
5.  **Archival (Optional):** Move the `001_➕_login_ui.md` file to `archive/FEATURE_authentication/`. Commit.

## 9. Conclusion ✅

This detailed implementation guide provides the structure and conventions for using **MDTM - Feature Structure** effectively. By consistently applying these rules for folder organization, file naming, YAML metadata, standardized values (with emojis!), and Markdown body content, you create a powerful, integrated, and AI-friendly task management system within your project repository. Remember that **consistency** is the key to making this system work smoothly for everyone (and every AI) involved.