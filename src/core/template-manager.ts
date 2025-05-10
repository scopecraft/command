/**
 * Template management functionality
 * Handles copying, listing, and applying templates for task creation
 */
import fs from 'fs';
import path from 'path';
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
 * @returns Path to the templates directory
 */
export function getTemplatesDirectory(): string {
  if (projectConfig.getMode() === 'roo_commander') {
    return path.join(process.cwd(), '.ruru', 'templates', 'toml-md');
  } else {
    return path.join(process.cwd(), '.tasks', 'templates');
  }
}

/**
 * Ensures templates directory exists and contains basic templates
 */
export function initializeTemplates(): void {
  const templatesDir = getTemplatesDirectory();
  
  // Create templates directory if it doesn't exist
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // In standalone mode, we need to copy templates from our bundled resources
  if (projectConfig.getMode() === 'standalone') {
    // Copy template files from docs/templates to .tasks/templates
    const sourceTemplatesDir = path.join(process.cwd(), 'docs', 'templates');
    
    if (fs.existsSync(sourceTemplatesDir)) {
      // Only copy MDTM task templates (01-06)
      const templateFiles = fs.readdirSync(sourceTemplatesDir).filter(file => {
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
 * @returns Array of template info objects
 */
export function listTemplates(): TemplateInfo[] {
  const templatesDir = getTemplatesDirectory();
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
      const [, id, name] = match;
      
      // Read first few lines to extract description
      let description = '';
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Look for a description in a comment or content
        const descMatch = content.match(/# Type of task|type = "([^"]+)"/);
        if (descMatch && descMatch[1]) {
          description = descMatch[1];
        } else {
          description = name.replace(/_/g, ' ');
        }
      } catch (error) {
        description = name.replace(/_/g, ' ');
      }
      
      templates.push({
        id: name,
        name: name.replace(/_/g, ' '),
        path: filePath,
        description
      });
    }
  }
  
  return templates;
}

/**
 * Get a template by ID
 * @param templateId Template ID
 * @returns Template content or null if not found
 */
export function getTemplate(templateId: string): string | null {
  const templates = listTemplates();
  const template = templates.find(t => t.id === templateId);
  
  if (!template) {
    return null;
  }
  
  try {
    return fs.readFileSync(template.path, 'utf-8');
  } catch (error) {
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
  let content = templateContent;

  // Apply values to placeholders in TOML frontmatter
  for (const [key, value] of Object.entries(values)) {
    if (key === 'content') {
      continue; // Skip content, handle it separately
    }

    // For scalar values
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      // Create a more robust regex that handles empty values and preserves comments
      const regex = new RegExp(`(${key}\\s*=\\s*)("[^"]*"|'[^']*'|[^#\\n\\r]*)(.*)`, 'g');

      // Prepare value for TOML
      let tomlValue: string;
      if (typeof value === 'string') {
        tomlValue = `"${value}"`;
      } else {
        tomlValue = String(value);
      }

      // Replace in TOML frontmatter
      content = content.replace(regex, `$1${tomlValue}$3`);

      // If the key wasn't found (no replacement occurred), add it to the frontmatter
      if (!content.includes(`${key} = ${tomlValue}`)) {
        // Find the end of TOML frontmatter marker
        const endOfFrontmatter = content.indexOf('+++', 3);
        if (endOfFrontmatter !== -1) {
          // Insert the key-value pair right before the end of frontmatter
          content =
            content.substring(0, endOfFrontmatter) +
            `${key} = ${tomlValue}\n` +
            content.substring(endOfFrontmatter);
        }
      }
    }

    // For array values
    if (Array.isArray(value)) {
      const regex = new RegExp(`(${key}\\s*=\\s*)\\[.*?\\](.*)`, 'g');

      // Prepare array for TOML
      const tomlArray = `[${value.map(item => typeof item === 'string' ? `"${item}"` : item).join(', ')}]`;

      // Replace in TOML frontmatter
      content = content.replace(regex, `$1${tomlArray}$2`);

      // If the key wasn't found, add it to the frontmatter
      if (!content.includes(`${key} = ${tomlArray}`)) {
        const endOfFrontmatter = content.indexOf('+++', 3);
        if (endOfFrontmatter !== -1) {
          content =
            content.substring(0, endOfFrontmatter) +
            `${key} = ${tomlArray}\n` +
            content.substring(endOfFrontmatter);
        }
      }
    }
  }

  // Replace title in Markdown (if specified)
  if (values.title) {
    // Replace title placeholder in Markdown body
    content = content.replace(/# \[Title\]/, `# ${values.title}`);
  }

  // Apply custom content if provided
  if (values.content) {
    // Find the end of TOML frontmatter
    const endOfFrontmatter = content.indexOf('+++', 3) + 3;

    // Split content at Markdown breakpoint (usually after first heading)
    let beforeContent = content.substring(0, endOfFrontmatter);

    // Rest of content after frontmatter
    const afterContent = content.substring(endOfFrontmatter);

    // Split after first heading
    const parts = afterContent.split('\n\n', 2);
    if (parts.length > 1) {
      // Keep title heading and replace content
      content = beforeContent + parts[0] + '\n\n' + values.content;
    } else {
      // Just append content
      content = beforeContent + '\n\n' + values.content;
    }
  }

  return content;
}