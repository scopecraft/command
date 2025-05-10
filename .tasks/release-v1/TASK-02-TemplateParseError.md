+++
id = "TASK-02-TemplateParseError"
title = "Fix Template Parsing Error"
type = "🐞 Bug"
status = "🟢 Done"
priority = "🔥 Highest"
created_date = "2025-05-10"
updated_date = "2025-05-10"
assigned_to = ""
phase = "release-v1"
+++

## Fix Template Parsing Error

When using the CLI command with the `--template` flag, the task creation fails with the error: "Failed to parse TOML frontmatter: Missing required field: id". This bug prevents the template-based task creation feature from working properly.

## Problem Analysis

The error occurs in the task creation process when applying a template. Specifically, the template application logic in `src/core/template-manager.ts` appears to be failing to correctly set the required 'id' field when parsing the TOML frontmatter.

Based on initial testing:
1. The `getTemplate` function successfully retrieves the template file
2. The `applyTemplate` function attempts to replace values in the template
3. When the resulting content is parsed via `parseTaskFile`, it fails with a missing 'id' field error
4. This occurs despite explicitly setting the ID field in the code

## Steps to Reproduce

1. Run `bun run dev:cli -- list-templates` to see available templates
2. Attempt to create a task using a template: `bun run dev:cli -- create --id "TASK-TEST" --title "Test Task" --phase "release-v1" --type "🧪 Test" --status "🟡 To Do" --priority "🔼 High" --template "test"`
3. Observe error: "Failed to parse TOML frontmatter: Missing required field: id"

## Potential Issues to Check

1. The template files may be using placeholders that aren't being properly replaced
2. The `applyTemplate` function may have a regex issue with how it's replacing the 'id' field
3. The TOML parsing in `parseTaskFile` might be strict about field existence even when values are set
4. The template format may be inconsistent with what the parser expects

## Action Items

- [ ] Examine template files in `.tasks/templates/` to verify format
- [ ] Add debug logging to `applyTemplate` to see the before/after content
- [ ] Verify that the regex for replacing values in `applyTemplate` is working as expected
- [ ] Check the regular expressions used for placeholder replacements
- [ ] Fix the specific issue in either the template manager or task parser
- [ ] Add validation to prevent this error from occurring again
- [ ] Add tests for template application

## Acceptance Criteria

- [ ] Command `bun run dev:cli -- create --template <template-id> ...` works successfully
- [ ] ID field is correctly set in the created task file
- [ ] All template placeholders are correctly replaced with provided values
- [ ] A template-based task can be created, viewed, updated, and deleted without errors
