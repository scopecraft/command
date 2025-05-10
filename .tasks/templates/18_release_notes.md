+++
# --- Basic Metadata (Template Definition) ---
template_id = "TOML-MD-TEMPLATE-RELEASE-NOTES-V1"
template_name = "Standard Release Notes/Changelog File"
template_description = "A template for generating local release notes files, summarizing changes between Git tags."
template_version = "1.0"
template_status = "active"
# --- TOML Schema for Release Notes Files ---
# id = "RELEASE-NOTES-{{version}}" # Example: RELEASE-NOTES-v1.2.0 (Auto-generated or manually set)
# title = "Release Notes - {{version}}" # Example: Release Notes - v1.2.0 (Auto-generated or manually set)
# version = "{{version}}" # Example: "v1.2.0" (Required, from workflow input)
# release_date = "{{YYYY-MM-DD}}" # (Required, from workflow execution date)
# status = "draft" # Options: "draft", "published" (Set by workflow)
# tags = ["release-notes", "changelog", "{{version}}"] # (Auto-generated)
# related_tags = ["{{previous_tag}}", "{{target_tag}}"] # Git tags used for generation (Required, from workflow input)
# summary = "" # Brief overall summary of the release (Optional, manual or auto-generated)
# --- Related Context ---
# related_context = [ # Optional links to planning docs, etc.
#     ".ruru/planning/github-deeper-integration/PLAN-RELEASE-NOTES-WHITEPAPER.md"
# ]
+++

# Release Notes - {{version}}

> **Release Date:** {{release_date}}
> **Generated from:** `{{previous_tag}}`...`{{target_tag}}`

*(Optional: Add a brief overall summary of the release here.)*

## ✨ New Features

*(Generated content for `feat:` commits will appear here. Example format below)*
*   `scope`: Subject line (`CommitHash`, Refs: `TASK-ID`)

## 🐛 Bug Fixes

*(Generated content for `fix:` commits will appear here. Example format below)*
*   `scope`: Subject line (`CommitHash`, Refs: `TASK-ID`)

## ⚡ Performance Improvements

*(Generated content for `perf:` commits will appear here.)*
*   `scope`: Subject line (`CommitHash`, Refs: `TASK-ID`)

## ♻️ Refactors

*(Generated content for `refactor:` commits will appear here.)*
*   `scope`: Subject line (`CommitHash`, Refs: `TASK-ID`)

## ⚙️ Chores / Internal

*(Generated content for `chore:` commits will appear here.)*
*   `scope`: Subject line (`CommitHash`, Refs: `TASK-ID`)

## 📝 Documentation

*(Generated content for `docs:` commits will appear here.)*
*   `scope`: Subject line (`CommitHash`, Refs: `TASK-ID`)

## 🧪 Tests

*(Generated content for `test:` commits will appear here.)*
*   `scope`: Subject line (`CommitHash`, Refs: `TASK-ID`)

*(Add other sections like 'Breaking Changes' (`BREAKING CHANGE:` footer) if needed based on Conventional Commit parsing)*