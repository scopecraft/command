+++
id = ""
title = ""
status = "investigating"
incident_start_time = ""
incident_end_time = ""
severity = ""
impact = ""
detection_method = ""
template_schema_doc = ".ruru/templates/toml-md/12_postmortem.README.md" # Link to schema documentation
# root_cause_summary = ""
action_items = []
involved_teams = []
tags = ["incident", "postmortem"]
# related_docs = []
+++

# Post-Mortem: << BRIEF_SUMMARY_OF_INCIDENT >>

**Incident ID:** << INC-YYYYMMDD-NNN >> | **Severity:** << SEV# >> | **Status:** << investigating | resolved | monitoring | closed >>

**Timeline:**
*   **<< YYYY-MM-DD HH:MM UTC >>:** (Detection) << Event description >>
*   **<< YYYY-MM-DD HH:MM UTC >>:** (Acknowledgement/Investigation) << Event description >>
*   **<< YYYY-MM-DD HH:MM UTC >>:** (Mitigation/Resolution Attempt) << Event description >>
*   **<< YYYY-MM-DD HH:MM UTC >>:** (Recovery) << Event description >>
*   ...

**Impact Summary:**
*   User-facing impact...
*   Business impact...

**Root Cause Analysis (RCA):**
*   Investigation process...
*   Underlying cause(s)...
*   Trigger vs. contributing factors...

**Resolution / Mitigation:**
*   Steps taken...
*   Why they worked...

**Action Items (Remediation & Prevention):**
*   - [ ] Action Item 1: << Description >> (Owner: << Name/Team >>, Due: << YYYY-MM-DD >>, Task: << MDTM ID >>)
*   - [ ] Action Item 2: << Description >> (Owner: << Name/Team >>, Due: << YYYY-MM-DD >>, Task: << MDTM ID >>)
*   ...

**Lessons Learned / What Went Well / What Could Be Improved:**
*   **What went well?**
*   **What could be improved?**
*   **Key takeaways:**

**Supporting Data / Links:**
*   Links to monitoring graphs, logs, etc.