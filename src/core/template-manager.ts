/**
 * Template Manager
 *
 * Handles task templates with section structure
 */

import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { getTemplatesDirectory } from './directory-utils.js';
import { getDefaultStatus } from './metadata/schema-service.js';
import { PATH_TYPES, createPathContext, getModesPath, resolvePath } from './paths/path-resolver.js';
import { ensureRequiredSections, parseTaskDocument, serializeTaskDocument } from './task-parser.js';
import type {
  ProjectConfig,
  TaskCreateOptions,
  TaskDocument,
  TaskStatus,
  TaskType,
} from './types.js';

/**
 * Template info
 */
export interface TemplateInfo {
  id: string;
  filename: string;
  type: TaskType;
  name: string;
}

/**
 * Get list of available templates
 */
export function listTemplates(projectRoot: string): TemplateInfo[] {
  const templatesDir = getTemplatesDirectory(projectRoot);

  if (!existsSync(templatesDir)) {
    return [];
  }

  const files = readdirSync(templatesDir);
  const templates: TemplateInfo[] = [];

  for (const file of files) {
    // Match pattern: NN_type.md
    const match = file.match(/^(\d+)_(\w+)\.md$/);
    if (match) {
      const type = match[2] as TaskType;
      templates.push({
        id: type,
        filename: file,
        type,
        name: getTemplateName(type),
      });
    }
  }

  return templates.sort((a, b) => a.filename.localeCompare(b.filename));
}

/**
 * Get a specific template content
 */
export function getTemplate(projectRoot: string, templateId: string): string | null {
  const templates = listTemplates(projectRoot);
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    return null;
  }

  const templatePath = join(getTemplatesDirectory(projectRoot), template.filename);

  if (!existsSync(templatePath)) {
    return null;
  }

  return readFileSync(templatePath, 'utf-8');
}

/**
 * Apply template to create task document
 */
export function applyTemplate(templateContent: string, options: TaskCreateOptions): TaskDocument {
  // Replace title placeholders
  const content = templateContent
    .replace(/<< ?FEATURE TITLE ?>>|<< ?TITLE ?>>/gi, options.title)
    .replace(/\[Title\]/gi, options.title)
    .replace(/# ?\[Title\]/gi, `# ${options.title}`);

  // Parse sections from template
  const sections = parseTemplateIntoSections(content);

  // Merge with provided options
  if (options.instruction) {
    sections.instruction = options.instruction;
  }

  if (options.tasks && options.tasks.length > 0) {
    sections.tasks = options.tasks.map((task) => `- [ ] ${task}`).join('\n');
  }

  // Add custom sections
  if (options.customSections) {
    Object.assign(sections, options.customSections);
  }

  // Ensure all required sections exist
  const finalSections = ensureRequiredSections(sections);

  // Create document
  const document: TaskDocument = {
    title: options.title,
    frontmatter: {
      type: options.type,
      status: options.status || (getDefaultStatus() as TaskStatus),
      area: options.area,
      ...options.customMetadata,
    },
    sections: finalSections,
  };

  return document;
}

/**
 * Parse template content into sections
 */
function parseTemplateIntoSections(content: string): Partial<TaskSections> {
  const sections: Partial<TaskSections> = {};
  const lines = content.split('\n');

  let currentSection: string | null = null;
  let sectionContent: string[] = [];

  for (const line of lines) {
    // Check for section header
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch) {
      // Save previous section
      if (currentSection) {
        sections[currentSection.toLowerCase()] = sectionContent.join('\n').trim();
      }

      currentSection = sectionMatch[1];
      sectionContent = [];
    } else if (currentSection) {
      // Add to current section
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection.toLowerCase()] = sectionContent.join('\n').trim();
  }

  // If no sections found, treat entire content as instruction
  if (Object.keys(sections).length === 0) {
    sections.instruction = content.trim();
  }

  return sections;
}

/**
 * Initialize templates
 */
export function initializeTemplates(projectRoot: string, override?: boolean): void {
  const context = createPathContext(projectRoot, { override });
  const templatesDir = resolvePath(PATH_TYPES.TEMPLATES, context);

  // Ensure directory exists
  if (!existsSync(templatesDir)) {
    mkdirSync(templatesDir, { recursive: true });
  }

  // Create default templates if none exist
  const existingTemplates = listTemplates(projectRoot);
  if (existingTemplates.length === 0) {
    createDefaultTemplates(templatesDir);
  }

  // Initialize mode templates with override
  initializeModeTemplates(projectRoot, override);

  // Initialize Claude commands
  initializeClaudeCommands(projectRoot);
}

/**
 * Create default templates
 */
function createDefaultTemplates(templatesDir: string): void {
  const templates = [
    {
      filename: '01_feature.md',
      content: `## Instruction

Implement << FEATURE TITLE >> with the following requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

## Tasks

- [ ] Analyze requirements and create design
- [ ] Implement core functionality
- [ ] Add unit tests
- [ ] Update documentation
- [ ] Code review and refactoring

## Deliverable

[Implementation details will be documented here]

## Log

[Progress updates will be tracked here]`,
    },
    {
      filename: '02_bug.md',
      content: `## Instruction

Fix the bug: << TITLE >>

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

## Tasks

- [ ] Reproduce the bug
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Add regression test
- [ ] Verify fix in staging

## Deliverable

[Fix details and test results will be documented here]

## Log

[Investigation and fix progress will be tracked here]`,
    },
    {
      filename: '03_chore.md',
      content: `## Instruction

Complete maintenance task: << TITLE >>

**Purpose:**
[Why this maintenance is needed]

**Scope:**
[What will be affected]

## Tasks

- [ ] Review current state
- [ ] Plan maintenance steps
- [ ] Execute maintenance
- [ ] Verify results
- [ ] Document changes

## Deliverable

[Maintenance results will be documented here]

## Log

[Progress updates will be tracked here]`,
    },
    {
      filename: '04_documentation.md',
      content: `## Instruction

Create/update documentation for: << TITLE >>

**Documentation Type:**
- [ ] User Guide
- [ ] API Reference
- [ ] Architecture Doc
- [ ] README
- [ ] Other: [Specify]

**Target Audience:**
[Who will read this documentation]

## Tasks

- [ ] Research existing documentation
- [ ] Outline documentation structure
- [ ] Write first draft
- [ ] Add examples/diagrams
- [ ] Review and polish

## Deliverable

[Documentation content or links will be provided here]

## Log

[Documentation progress will be tracked here]`,
    },
    {
      filename: '05_test.md',
      content: `## Instruction

Create/improve tests for: << TITLE >>

**Test Type:**
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests
- [ ] Performance Tests
- [ ] Other: [Specify]

**Coverage Goals:**
[What should be tested]

## Tasks

- [ ] Identify test scenarios
- [ ] Write test cases
- [ ] Implement tests
- [ ] Verify test coverage
- [ ] Document test approach

## Deliverable

[Test implementation and results will be documented here]

## Log

[Test development progress will be tracked here]`,
    },
    {
      filename: '06_spike.md',
      content: `## Instruction

Research and investigate: << TITLE >>

**Research Questions:**
1. [Question 1]
2. [Question 2]
3. [Question 3]

**Success Criteria:**
[What defines a successful spike]

## Tasks

- [ ] Define research scope
- [ ] Gather information
- [ ] Prototype/experiment
- [ ] Document findings
- [ ] Present recommendations

## Deliverable

[Research findings and recommendations will be documented here]

## Log

[Research progress and discoveries will be tracked here]`,
    },
  ];

  // Write templates
  for (const template of templates) {
    const templatePath = join(templatesDir, template.filename);
    if (!existsSync(templatePath)) {
      writeFileSync(templatePath, template.content, 'utf-8');
    }
  }
}

/**
 * Get human-readable template name
 */
function getTemplateName(type: TaskType): string {
  const names: Record<TaskType, string> = {
    feature: '🌟 Feature',
    bug: '🐞 Bug',
    chore: '🧹 Chore',
    documentation: '📖 Documentation',
    test: '🧪 Test',
    spike: '💡 Spike/Research',
    idea: '💭 Idea',
  };

  return names[type] || type;
}

// Type import to fix the missing import
interface TaskSections {
  instruction: string;
  tasks: string;
  deliverable: string;
  log: string;
  [key: string]: string;
}

/**
 * Initialize mode templates
 */
function initializeModeTemplates(projectRoot: string, override?: boolean): void {
  // Get the destination path using path-resolver with override
  const context = createPathContext(projectRoot, { override });
  const modesPath = getModesPath(context);

  // Find source templates directory
  let sourceModesDir: string;

  // Check if we're in a test environment (vitest sets NODE_ENV or process.argv[0] contains vitest)
  const isTest =
    process.env.NODE_ENV === 'test' ||
    process.argv[0].includes('vitest') ||
    process.argv[1].includes('vitest');

  if (isTest) {
    // In test environment, look for src/templates relative to project root
    // Use import.meta.url to find the project root
    const fileUrl = import.meta.url.replace('file://', '');
    const currentDir = dirname(fileUrl);
    // From src/core/template-manager.ts up to project root, then to src/templates/modes
    sourceModesDir = join(currentDir, '..', '..', 'src', 'templates', 'modes');
  } else {
    // For bundled code, templates are always relative to the CLI executable
    // The CLI is in dist/cli/cli.js and templates are in dist/templates/
    const execDir = dirname(process.argv[1]); // Get directory of the executing script
    sourceModesDir = join(execDir, '..', 'templates', 'modes');
  }

  if (!existsSync(sourceModesDir)) {
    // Mode templates not available in this installation
    return;
  }

  // Ensure destination exists
  if (!existsSync(modesPath)) {
    mkdirSync(modesPath, { recursive: true });
  }

  // Recursively copy all mode templates
  cpSync(sourceModesDir, modesPath, {
    recursive: true,
    filter: (src: string) => {
      // Always allow directories
      if (statSync(src).isDirectory()) {
        return true;
      }

      // Skip files if destination already exists (don't overwrite user customizations)
      const relativePath = src.replace(sourceModesDir, '');
      const destPath = join(modesPath, relativePath);
      return !existsSync(destPath);
    },
  });
}

/**
 * Initialize Claude commands
 */
function initializeClaudeCommands(projectRoot: string): void {
  // Claude commands go in .claude/commands/ relative to project root
  const claudeCommandsDir = join(projectRoot, '.claude', 'commands');

  // Find source templates directory
  let sourceCommandsDir: string;

  // Check if we're in a test environment
  const isTest =
    process.env.NODE_ENV === 'test' ||
    process.argv[0].includes('vitest') ||
    process.argv[1].includes('vitest');

  if (isTest) {
    // In test environment, look for src/templates relative to project root
    const fileUrl = import.meta.url.replace('file://', '');
    const currentDir = dirname(fileUrl);
    sourceCommandsDir = join(currentDir, '..', '..', 'src', 'templates', 'claude-commands');
  } else {
    // For bundled code, templates are always relative to the CLI executable
    const execDir = dirname(process.argv[1]);
    sourceCommandsDir = join(execDir, '..', 'templates', 'claude-commands');
  }

  if (!existsSync(sourceCommandsDir)) {
    // Claude command templates not available in this installation
    return;
  }

  // Ensure destination directory exists
  if (!existsSync(claudeCommandsDir)) {
    mkdirSync(claudeCommandsDir, { recursive: true });
  }

  // Recursively copy all Claude commands
  cpSync(sourceCommandsDir, claudeCommandsDir, {
    recursive: true,
    filter: (src: string) => {
      // Always allow directories
      if (statSync(src).isDirectory()) {
        return true;
      }

      // Skip files if destination already exists (don't overwrite user customizations)
      const relativePath = src.replace(sourceCommandsDir, '');
      const destPath = join(claudeCommandsDir, relativePath);
      return !existsSync(destPath);
    },
  });
}
