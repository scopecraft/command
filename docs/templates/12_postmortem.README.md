# Documentation: Template `12_postmortem.md`

## Purpose

This template is used for documenting incident reports and post-mortem analyses. It provides a structured format for capturing the timeline, impact, root cause, resolution, and follow-up actions related to a significant operational incident. These documents are typically stored in `.ruru/docs/incidents/` or `.ruru/reports/incidents/`.

## Usage

1.  Copy `.ruru/templates/toml-md/12_postmortem.md` to the appropriate directory.
2.  Rename the file using the incident ID or date (e.g., `inc_20250417_api_latency.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, providing details about the incident timing, severity, impact, and detection.
4.  Replace the placeholder content in the Markdown body with a detailed timeline, impact summary, root cause analysis (RCA), resolution steps, action items, and lessons learned.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the incident.
    *   Example: `"INC-20250417-001"`

*   `title` (String, Required):
    *   A brief, descriptive summary of the incident.
    *   Example: `"API Latency Spike during Peak Hours"`, `"Database Connection Pool Exhaustion"`

*   `status` (String, Required):
    *   The current status of the post-mortem process.
    *   Options: `"investigating"`, `"resolved"` (incident fixed, RCA pending/done), `"monitoring"` (fix deployed, observing stability), `"closed"` (RCA complete, action items tracked).

*   `incident_start_time` (String, Required):
    *   The timestamp when the incident's impact began, in ISO 8601 format (e.g., `"YYYY-MM-DDTHH:MM:SSZ"`).

*   `incident_end_time` (String, Required if resolved):
    *   The timestamp when the incident's impact ended (service restored), in ISO 8601 format. Leave empty or omit if the incident is ongoing.

*   `severity` (String, Required):
    *   The severity level of the incident, based on defined criteria (e.g., SEV1-SEV4).
    *   Example: `"sev1"`, `"sev2"`, `"sev3"`, `"sev4"`

*   `impact` (String, Required):
    *   A concise description of the user-facing or business impact.
    *   Example: `"50% of API requests failing for 30 minutes"`, `"User login unavailable"`

*   `detection_method` (String, Required):
    *   How the incident was first detected.
    *   Example: `"monitoring_alert (PagerDuty)"`, `"user_report (Support Ticket)"`, `"internal_test (QA)"`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/12_postmortem.README.md"`

*   `root_cause_summary` (String, Optional):
    *   A very brief summary of the root cause(s), typically filled in after the RCA is complete. Details belong in the Markdown body.

*   `action_items` (Array of Strings, Required upon resolution):
    *   List of MDTM task IDs created for remediation and prevention follow-up actions.

*   `involved_teams` (Array of Strings, Required):
    *   List of teams primarily involved in investigating or resolving the incident.
    *   Example: `["Team:Backend", "Team:SRE", "Team:Database"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization. Should include `"incident"` and `"postmortem"`. Add severity, affected services, etc.
    *   Example: `["incident", "postmortem", "latency", "api", "database", "sev2"]`

*   `related_docs` (Array of Strings, Optional):
    *   List of paths or URLs to relevant monitoring dashboards, log queries, runbooks, ADRs, etc.

## Markdown Body

The section below the `+++` TOML block contains the standard structure for a post-mortem report:

*   `# Post-Mortem: << BRIEF_SUMMARY_OF_INCIDENT >>`: Replace with the incident title.
*   `**Incident ID:** | **Severity:** | **Status:**`: Display key info from TOML.
*   `**Timeline:**`: A chronological list of key events (detection, investigation, mitigation, recovery) with timestamps (UTC recommended).
*   `**Impact Summary:**`: Detailed description of user and business impact.
*   `**Root Cause Analysis (RCA):**`: Explanation of the investigation, the underlying cause(s), trigger vs. contributing factors.
*   `**Resolution / Mitigation:**`: Steps taken to fix the immediate issue and why they worked.
*   `**Action Items (Remediation & Prevention):**`: List of follow-up tasks (using GFM checklists) to prevent recurrence, including owner, due date, and MDTM task ID. Should align with `action_items` in TOML.
*   `**Lessons Learned / What Went Well / What Could Be Improved:**`: Reflection on the incident response process.
*   `**Supporting Data / Links:**`: Links to relevant graphs, logs, etc.