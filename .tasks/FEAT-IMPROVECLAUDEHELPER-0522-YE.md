+++
id = "FEAT-IMPROVECLAUDEHELPER-0522-YE"
title = "Improve claude-helper util"
type = "🌟 Feature"
status = "🔵 In Progress"
priority = "▶️ Medium"
created_date = "2025-05-22"
updated_date = "2025-05-22"
assigned_to = ""
+++

# Improve claude-helper util

Claude-helper util used in the script project is a good idea.

It should be abstracted to a basic package that act as a prompt provider to claude with minimal SDK + CLI ( wrap claude).

the useSystemPromptFlag: true should also be removed, if the system prompt is provided, then its true.

Ex:

systemPrompt: "scripts/prompts/systems/changelog-writer.md"
useSystemPromptFlag: true

(the second param is not necessary). 

NOTE: THIS TASK NEED TO BE IMPROVED AND BRAINSTORMED.
