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
  // Try to copy from bundled templates first
  const bundledTemplatesDir = path.join(
    path.dirname(import.meta.url).replace('file://', ''),
    '..',
    'templates'
  );
  const templateFiles = [
    '01_mdtm_feature.md',
    '02_mdtm_bug.md',
    '03_mdtm_chore.md',
    '04_mdtm_documentation.md',
    '05_mdtm_test.md',
    '06_mdtm_spike.md',
  ];

  let copiedFromBundled = false;

  if (fs.existsSync(bundledTemplatesDir)) {
    try {
      for (const file of templateFiles) {
        const sourcePath = path.join(bundledTemplatesDir, file);
        const targetPath = path.join(templatesDir, file);

        if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
      copiedFromBundled = true;
    } catch (error) {
      console.warn('Failed to copy bundled templates, falling back to hardcoded templates');
    }
  }

  // If bundled templates don't exist or copy failed, create minimal fallback templates
  if (!copiedFromBundled) {
    // Create minimal fallback templates
    const fallbackFeature = `# [Title]

## Description ✍️
Describe the feature in detail.

## Acceptance Criteria ✅
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes 📝
Add any technical details or implementation considerations here.
`;

    const fallbackBug = `# [Title]

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

    // Only create feature and bug templates as fallback
    if (!fs.existsSync(path.join(templatesDir, '01_mdtm_feature.md'))) {
      fs.writeFileSync(path.join(templatesDir, '01_mdtm_feature.md'), fallbackFeature);
    }
    if (!fs.existsSync(path.join(templatesDir, '02_mdtm_bug.md'))) {
      fs.writeFileSync(path.join(templatesDir, '02_mdtm_bug.md'), fallbackBug);
    }

    console.warn('Only basic templates created. Full template set available after installation.');
  }
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
  // Check if template has frontmatter (legacy format)
  const frontmatterRegex = /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/;
  const match = templateContent.match(frontmatterRegex);

  let markdownContent: string;
  let metadata: Record<string, any> = {};

  if (match) {
    // Legacy template with frontmatter
    const [, tomlContent, content] = match;
    markdownContent = content;
    
    // Try to parse existing TOML
    try {
      metadata = parse(tomlContent) as Record<string, any>;
    } catch (error) {
      console.warn('Template has invalid TOML, using defaults');
    }
  } else {
    // New template format - just markdown
    markdownContent = templateContent;
  }

  // Apply all values from the input, merging with any existing metadata
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

  // Ensure required fields are present
  const requiredFields = ['title', 'type'];
  for (const field of requiredFields) {
    if (!metadata[field]) {
      console.warn(`Warning: Required field '${field}' is not set in template or values`);
    }
  }

  // Don't include empty ID in metadata - let task-crud generate it
  if (metadata.id === '') {
    delete metadata.id;
  }

  // Convert the metadata to TOML
  const newTomlContent = stringify(metadata);

  // Build the complete task file
  let newContent = `+++\n${newTomlContent}+++\n\n${markdownContent}`;

  // Replace title in Markdown (if specified)
  if (values.title) {
    // Replace title placeholder in Markdown body
    newContent = newContent.replace(/# \[Title\]/, `# ${values.title}`);
    // Replace various template title placeholders
    newContent = newContent.replace(/# << CONCISE .+ >>/, `# ${values.title}`);
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
}
