# Documentation: Template `11_meeting_notes.md`

## Purpose

This template is used for recording minutes, decisions, and action items from meetings. It provides a structured format for capturing key information discussed during a meeting. These notes are typically stored in `.ruru/docs/meetings/` or a project-specific `notes/` directory.

## Usage

1.  Copy `.ruru/templates/toml-md/11_meeting_notes.md` to the appropriate directory.
2.  Rename the file descriptively, often including the date (e.g., `2025-04-17_planning_meeting.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, including `title`, `meeting_date`, `facilitator`, `note_taker`, and `participants`.
4.  Replace the placeholder content in the Markdown body with the actual meeting agenda, discussion points, decisions, and action items. Use GFM checklists (`- [ ]`) for action items.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the meeting notes.
    *   Example: `"MEET-20250417-1400"`, `"MEET-PROJ-ALPHA-PLAN-01"`

*   `title` (String, Required):
    *   The subject or main topic of the meeting.
    *   Example: `"Project Alpha Kickoff Meeting"`, `"Weekly Backend Sync"`

*   `meeting_date` (String, Required):
    *   The date the meeting was held, in `YYYY-MM-DD` format.

*   `start_time` (String, Optional):
    *   The time the meeting started, in `HH:MM` (24-hour) format.

*   `end_time` (String, Optional):
    *   The time the meeting ended, in `HH:MM` (24-hour) format.

*   `facilitator` (String, Required):
    *   The name or role of the person who led the meeting.
    *   Example: `"🧑‍💻 User:ProjectManager"`, `"🤖 project-manager"`

*   `note_taker` (String, Required):
    *   The name or role of the person who recorded the notes.

*   `participants` (Array of Strings, Required):
    *   List of attendees present at the meeting.
    *   Example: `["🧑‍💻 User:Alice", "🧑‍💻 User:Bob", "🤖 technical-architect"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/11_meeting_notes.README.md"`

*   `location` (String, Optional):
    *   Where the meeting took place.
    *   Example: `"Virtual (Google Meet)"`, `"Conference Room B"`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization. Should always include `"meeting"`.
    *   Example: `["meeting", "planning", "review", "brainstorm", "project-alpha", "backend"]`

*   `related_tasks` (Array of Strings, Optional):
    *   List of MDTM task IDs discussed during the meeting or generated as action items.

*   `related_docs` (Array of Strings, Optional):
    *   List of paths or URLs to documents discussed (PRDs, ADRs, presentations, etc.).

*   `project` (String, Optional):
    *   Identifier for the project if the meeting notes cover topics relevant to a specific project in a multi-project workspace.

## Markdown Body

The section below the `+++` TOML block contains the standard structure for meeting notes:

*   `# << SUBJECT_OF_THE_MEETING >> - Meeting Notes`: Replace with the meeting title.
*   `**Date:** | **Time:** | **Location:**`: Display key info from TOML.
*   `**Facilitator:**`, `**Note Taker:**`: Display info from TOML.
*   `**Attendees:**`: List participants from TOML.
*   `**(Optional) Absent:**`: List key people who were invited but absent.
*   `## Agenda 🎯`: List the planned topics for discussion.
*   `## Discussion Points / Notes 📝`: Record the key points, discussions, and questions raised for each agenda item. Use subheadings (`###`) for each item.
*   `## Decisions Made ✅`: Summarize any decisions reached during the meeting, including the owner if applicable.
*   `## Action Items ➡️`: List specific, actionable tasks assigned during the meeting. Use GFM checklists (`- [ ]`) and include owner, due date (optional), and related MDTM task ID (optional).
*   `## Next Steps / Follow-up 💡`: Note any immediate follow-up actions, like scheduling the next meeting or distributing notes.
*   `## Related Links 🔗 (Optional)`: Link to any resources mentioned or shared during the meeting.