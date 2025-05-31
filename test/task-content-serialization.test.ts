import { describe, it, expect } from 'bun:test';
import { parseTaskDocument, serializeTaskDocument, serializeTaskContent } from '../src/core/v2/task-parser.js';

describe('Task Content Serialization', () => {
  const sampleTaskContent = `# Test Task

---
type: feature
status: todo
area: core
priority: medium
tags:
  - test
  - content
---

## Instruction
This is the instruction content for testing.

## Tasks
- [ ] First task
- [ ] Second task
- [x] Completed task

## Deliverable
Expected deliverable content here.

## Log
- 2025-05-30: Created test task
- 2025-05-31: Added more content

## CustomSection
This is a custom section that should be preserved.

## AnotherCustom
Another custom section with special content.
`;

  it('should serialize full document with serializeTaskDocument', () => {
    const task = parseTaskDocument(sampleTaskContent);
    const serialized = serializeTaskDocument(task);
    
    // Should include title
    expect(serialized).toContain('# Test Task');
    
    // Should include frontmatter
    expect(serialized).toContain('---');
    expect(serialized).toContain('type: feature');
    expect(serialized).toContain('status: todo');
    
    // Should include all sections
    expect(serialized).toContain('## Instruction');
    expect(serialized).toContain('This is the instruction content');
    expect(serialized).toContain('## Customsection');
  });

  it('should serialize only content with serializeTaskContent', () => {
    const task = parseTaskDocument(sampleTaskContent);
    const contentOnly = serializeTaskContent(task);
    
    // Should NOT include title
    expect(contentOnly).not.toContain('# Test Task');
    
    // Should NOT include frontmatter
    expect(contentOnly).not.toContain('---');
    expect(contentOnly).not.toContain('type: feature');
    expect(contentOnly).not.toContain('status: todo');
    
    // Should include all sections
    expect(contentOnly).toContain('## Instruction');
    expect(contentOnly).toContain('This is the instruction content');
    expect(contentOnly).toContain('## Tasks');
    expect(contentOnly).toContain('- [ ] First task');
    expect(contentOnly).toContain('## Deliverable');
    expect(contentOnly).toContain('Expected deliverable content');
    expect(contentOnly).toContain('## Log');
    expect(contentOnly).toContain('2025-05-30: Created test task');
    
    // Should include custom sections
    expect(contentOnly).toContain('## Customsection');
    expect(contentOnly).toContain('custom section that should be preserved');
    expect(contentOnly).toContain('## Anothercustom');
    expect(contentOnly).toContain('Another custom section');
  });

  it('should maintain section order in both serialization methods', () => {
    const task = parseTaskDocument(sampleTaskContent);
    const full = serializeTaskDocument(task);
    const contentOnly = serializeTaskContent(task);
    
    // Check order in both
    const fullSections = full.match(/## \w+/g);
    const contentSections = contentOnly.match(/## \w+/g);
    
    expect(fullSections).toEqual(contentSections);
    expect(contentSections).toEqual([
      '## Instruction',
      '## Tasks', 
      '## Deliverable',
      '## Log',
      '## Customsection',
      '## Anothercustom'
    ]);
  });

  it('should handle empty sections gracefully', () => {
    const minimalTask = `# Minimal Task

---
type: bug
status: todo
area: core
---

## Instruction
Has content

## Tasks

## Deliverable

## Log
`;

    const task = parseTaskDocument(minimalTask);
    const contentOnly = serializeTaskContent(task);
    
    // Should include section headers even if empty
    expect(contentOnly).toContain('## Instruction\nHas content');
    expect(contentOnly).toContain('## Tasks\n');
    expect(contentOnly).toContain('## Deliverable\n');
    expect(contentOnly).toContain('## Log\n');
  });

  it('should capitalize custom section names', () => {
    const task = parseTaskDocument(sampleTaskContent);
    const contentOnly = serializeTaskContent(task);
    
    // Keys are stored lowercase, display capitalizes first letter
    expect(contentOnly).toContain('## Customsection');
    expect(contentOnly).not.toContain('## customsection');
    expect(contentOnly).toContain('## Anothercustom');
    expect(contentOnly).not.toContain('## anothercustom');
  });
});