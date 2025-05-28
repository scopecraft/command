/**
 * V2 Template Manager
 * 
 * Handles task templates with v2 section structure
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { TaskDocument, TaskCreateOptions, TaskType, V2Config } from './types.js';
import { parseTaskDocument, serializeTaskDocument, ensureRequiredSections } from './task-parser.js';
import { getTemplatesDirectory } from './directory-utils.js';

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
        name: getTemplateName(type)
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
  const template = templates.find(t => t.id === templateId);
  
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
export function applyTemplate(
  templateContent: string,
  options: TaskCreateOptions
): TaskDocument {
  // Replace title placeholders
  let content = templateContent
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
    sections.tasks = options.tasks.map(task => `- [ ] ${task}`).join('\n');
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
      status: options.status || '🟡 To Do',
      area: options.area,
      ...options.customMetadata
    },
    sections: finalSections
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
 * Initialize v2 templates
 */
export function initializeV2Templates(projectRoot: string): void {
  const templatesDir = getTemplatesDirectory(projectRoot);
  
  // Ensure directory exists
  if (!existsSync(templatesDir)) {
    mkdirSync(templatesDir, { recursive: true });
  }
  
  // Create default templates if none exist
  const existingTemplates = listTemplates(projectRoot);
  if (existingTemplates.length === 0) {
    createDefaultV2Templates(templatesDir);
  }
}

/**
 * Create default v2 templates
 */
function createDefaultV2Templates(templatesDir: string): void {
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

[Progress updates will be tracked here]`
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

[Investigation and fix progress will be tracked here]`
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

[Progress updates will be tracked here]`
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

[Documentation progress will be tracked here]`
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

[Test development progress will be tracked here]`
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

[Research progress and discoveries will be tracked here]`
    }
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
    idea: '💭 Idea'
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