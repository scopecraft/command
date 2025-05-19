/**
 * Template management functionality
 * Handles copying, listing, and applying templates for task creation
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from '@iarna/toml';
import type { RuntimeConfig } from './config/types.js';
import { projectConfig } from './project-config.js';

/**
 * Template metadata
 */
export interface TemplateInfo {
  id: string;
  name: string;
  path: string;
  description: string;
}

/**
 * Get the templates directory
 * @param config Optional runtime configuration
 * @returns Path to the templates directory
 */
export function getTemplatesDirectory(config?: RuntimeConfig): string {
  // If runtime config is provided and has tasksDir, use it to construct templates path
  if (config?.tasksDir) {
    return path.join(config.tasksDir, '.templates');
  }
  // Otherwise fall back to project config
  return projectConfig.getTemplatesDirectory();
}

/**
 * Ensures templates directory exists and contains basic templates
 * @param config Optional runtime configuration
 */
export function initializeTemplates(config?: RuntimeConfig): void {
  const templatesDir = getTemplatesDirectory(config);

  // Create templates directory if it doesn't exist
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Copy templates from docs/templates to .tasks/templates
  const sourceTemplatesDir = path.join(process.cwd(), 'docs', 'templates');

  if (fs.existsSync(sourceTemplatesDir)) {
    // Only copy MDTM task templates (01-06)
    const templateFiles = fs.readdirSync(sourceTemplatesDir).filter((file) => {
      // Match files like 01_mdtm_feature.md, 02_mdtm_bug.md, etc.
      return /^0[1-6]_mdtm_.+\.md$/.test(file);
    });

    for (const file of templateFiles) {
      const sourcePath = path.join(sourceTemplatesDir, file);
      const targetPath = path.join(templatesDir, file);

      // Only copy if the file doesn't already exist
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  } else {
    // If templates not found, create some basic ones
    createBasicTemplates(templatesDir);
  }
}

/**
 * Create basic templates when source templates are not available
 * @param templatesDir Directory to create templates in
 */
function createBasicTemplates(templatesDir: string): void {
  const featureTemplate = `+++
id = ""               # Will be auto-generated if not provided
title = ""            # REQUIRED: Human-readable title
status = "🟡 To Do"    # Current status
type = "🌟 Feature"    # Type of task
priority = "▶️ Medium" # Priority level
created_date = ""     # Will be auto-filled
updated_date = ""     # Will be auto-filled
assigned_to = ""      # Who is responsible for this task
tags = []             # Relevant keywords
+++

# [Title]

## Description ✍️
Describe the feature in detail.

## Acceptance Criteria ✅
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes 📝
Add any technical details or implementation considerations here.
`;

  const bugTemplate = `+++
id = ""               # Will be auto-generated if not provided
title = ""            # REQUIRED: Human-readable title
status = "🟡 To Do"    # Current status
type = "🐞 Bug"        # Type of task
priority = "🔼 High"   # Priority level
created_date = ""     # Will be auto-filled
updated_date = ""     # Will be auto-filled
assigned_to = ""      # Who is responsible for this task
tags = []             # Relevant keywords
+++

# [Title]

## Description ✍️
Describe the bug in detail.

## Steps to Reproduce 🔄
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior ✓
What should happen?

## Actual Behavior ✗
What actually happens?

## Fix Implementation 🔧
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Add regression test
`;

  // Write basic templates
  fs.writeFileSync(path.join(templatesDir, '01_mdtm_feature.md'), featureTemplate);
  fs.writeFileSync(path.join(templatesDir, '02_mdtm_bug.md'), bugTemplate);
}

/**
 * List available templates
 * @param config Optional runtime configuration
 * @returns Array of template info objects
 */
export function listTemplates(config?: RuntimeConfig): TemplateInfo[] {
  const templatesDir = getTemplatesDirectory(config);
  const templates: TemplateInfo[] = [];

  if (!fs.existsSync(templatesDir)) {
    return templates;
  }

  const files = fs.readdirSync(templatesDir);

  for (const file of files) {
    // Only include .md files and skip README files
    if (!file.endsWith('.md') || file.includes('README')) {
      continue;
    }

    const filePath = path.join(templatesDir, file);

    // Extract template ID and name from filename
    const match = file.match(/^(\d+)_mdtm_(.+)\.md$/);
    if (match) {
      const [, _id, name] = match;

      // Read first few lines to extract description
      let description = '';
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Look for a description in a comment or content
        const descMatch = content.match(/# Type of task|type = "([^"]+)"/);
        if (descMatch?.[1]) {
          description = descMatch[1];
        } else {
          description = name.replace(/_/g, ' ');
        }
      } catch (_error) {
        description = name.replace(/_/g, ' ');
      }

      templates.push({
        id: name,
        name: name.replace(/_/g, ' '),
        path: filePath,
        description,
      });
    }
  }

  return templates;
}

/**
 * Get a template by ID
 * @param templateId Template ID
 * @param config Optional runtime configuration
 * @returns Template content or null if not found
 */
export function getTemplate(templateId: string, config?: RuntimeConfig): string | null {
  const templates = listTemplates(config);
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    return null;
  }

  try {
    return fs.readFileSync(template.path, 'utf-8');
  } catch (_error) {
    return null;
  }
}

/**
 * Apply template with values
 * @param templateContent Template content
 * @param values Values to apply to the template
 * @returns Processed template content
 */
export function applyTemplate(templateContent: string, values: Record<string, any>): string {
  // We need to prevent duplicate fields that can cause TOML parsing errors
  // Extract the TOML frontmatter
  const frontmatterRegex = /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/;
  const match = templateContent.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid template format: missing or malformed TOML frontmatter');
  }

  const [, tomlContent, markdownContent] = match;

  // Parse the existing TOML to get a clean object
  let metadata: Record<string, any> = {};
  try {
    // Try to parse the existing TOML (if it's valid)
    try {
      metadata = parse(tomlContent) as Record<string, any>;
    } catch (error) {
      // If parsing fails, we'll just start with an empty object
      console.warn(
        `Warning: Template has invalid TOML, starting fresh: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Ensure required fields are present in values
    const requiredFields = ['id', 'title', 'type'];
    for (const field of requiredFields) {
      if (!values[field] && !metadata[field]) {
        console.warn(`Warning: Required field '${field}' is not set in template or values`);
      }
    }

    // Apply all values from the input
    for (const [key, value] of Object.entries(values)) {
      if (key === 'content') {
        continue; // Skip content, handle it separately
      }

      // Skip undefined or null values
      if (value === undefined || value === null) {
        continue;
      }

      // Set the value in our metadata object
      metadata[key] = value;
    }

    // Ensure ID is set (critical field)
    if (values.id) {
      metadata.id = values.id;
    }

    // Convert the metadata back to TOML
    const newTomlContent = stringify(metadata);

    // Rebuild the template with the new TOML and keep the markdown part
    let newContent = `+++\n${newTomlContent}+++\n\n${markdownContent}`;

    // Replace title in Markdown (if specified)
    if (values.title) {
      // Replace title placeholder in Markdown body
      newContent = newContent.replace(/# \[Title\]/, `# ${values.title}`);
      newContent = newContent.replace(/<< CONCISE BUG SUMMARY >>/, values.title);
    }

    // Apply custom content if provided
    if (values.content) {
      // Find the end of TOML frontmatter and the first empty line after the title
      const endOfFrontmatter = newContent.indexOf('+++', 3) + 3;

      // Rest of content after frontmatter
      const afterContent = newContent.substring(endOfFrontmatter);

      // Split after first heading
      const parts = afterContent.split('\n\n', 2);
      if (parts.length > 1) {
        // Keep title heading and replace content
        newContent = `${newContent.substring(0, endOfFrontmatter) + parts[0]}\n\n${values.content}`;
      } else {
        // Just append content
        newContent = `${newContent.substring(0, endOfFrontmatter)}\n\n${values.content}`;
      }
    }

    return newContent;
  } catch (error) {
    throw new Error(
      `Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
