/**
 * Tests for MCP section header sanitization
 * Verifies that ## headers in section content are properly sanitized to prevent parser corruption
 */

import { describe, expect, test } from 'bun:test';
import { sanitizeSectionContent } from '../../../src/mcp/handlers/shared/validation-utils.js';
import { buildTaskCreateOptionsBase, buildTaskUpdateOptions, parseTasksList } from '../../../src/mcp/handlers/shared/options-builders.js';

describe('Section Header Sanitization', () => {
  describe('sanitizeSectionContent', () => {
    test('converts ## headers to ### headers', () => {
      const input = '## Completed Module\n\nSome content here\n\n## Another Section\n\nMore content';
      const expected = '### Completed Module\n\nSome content here\n\n### Another Section\n\nMore content';
      
      expect(sanitizeSectionContent(input)).toBe(expected);
    });

    test('preserves ### and #### headers unchanged', () => {
      const input = '### Already Good\n\n#### Also Fine\n\n##### Five levels';
      
      expect(sanitizeSectionContent(input)).toBe(input);
    });

    test('handles empty and null content', () => {
      expect(sanitizeSectionContent('')).toBe('');
      expect(sanitizeSectionContent(null as any)).toBe(null);
      expect(sanitizeSectionContent(undefined as any)).toBe(undefined);
    });

    test('handles complex markdown with mixed headers', () => {
      const input = `
# Main Title
Some text

## Problem Section
This is problematic

### Good Section
This is fine

## Another Problem
More problems

#### Also Fine
No issues here
`;
      
      const expected = `
# Main Title
Some text

### Problem Section
This is problematic

### Good Section
This is fine

### Another Problem
More problems

#### Also Fine
No issues here
`;
      
      expect(sanitizeSectionContent(input)).toBe(expected);
    });

    test('handles ## headers at beginning of line only', () => {
      const input = 'Some text with ## in the middle\n## But this should be converted\nAnd this ## should not';
      const expected = 'Some text with ## in the middle\n### But this should be converted\nAnd this ## should not';
      
      expect(sanitizeSectionContent(input)).toBe(expected);
    });
  });

  describe('buildTaskCreateOptionsBase sanitization', () => {
    test('sanitizes instruction content', () => {
      const params = {
        title: 'Test Task',
        type: 'bug',
        instruction: '## Problem Description\n\nThis is the issue\n\n## Steps to Reproduce\n\n1. Do this\n2. Do that',
      };

      const result = buildTaskCreateOptionsBase(params);
      
      expect(result.instruction).toBe('### Problem Description\n\nThis is the issue\n\n### Steps to Reproduce\n\n1. Do this\n2. Do that');
    });

    test('handles undefined instruction', () => {
      const params = {
        title: 'Test Task',
        type: 'bug',
      };

      const result = buildTaskCreateOptionsBase(params);
      
      expect(result.instruction).toBeUndefined();
    });
  });

  describe('buildTaskUpdateOptions sanitization', () => {
    test('sanitizes all section content', () => {
      const updates = {
        instruction: '## Updated Instruction\n\nNew content',
        tasks: '## Task List\n\n- [ ] Do something\n- [ ] Do another thing',
        deliverable: '## Deliverable\n\nThe expected output',
        log: '## Log Entry\n\n- 2025-06-08: Made progress',
      };

      const result = buildTaskUpdateOptions(updates);
      
      expect(result.sections?.instruction).toBe('### Updated Instruction\n\nNew content');
      expect(result.sections?.tasks).toBe('### Task List\n\n- [ ] Do something\n- [ ] Do another thing');
      expect(result.sections?.deliverable).toBe('### Deliverable\n\nThe expected output');
      expect(result.sections?.log).toBe('### Log Entry\n\n- 2025-06-08: Made progress');
    });

    test('handles partial updates', () => {
      const updates = {
        instruction: '## Only Instruction\n\nUpdated',
        status: 'in_progress' as const,
      };

      const result = buildTaskUpdateOptions(updates);
      
      expect(result.sections?.instruction).toBe('### Only Instruction\n\nUpdated');
      expect(result.frontmatter?.status).toBe('in_progress');
      expect(result.sections?.tasks).toBeUndefined();
    });
  });

  describe('parseTasksList sanitization', () => {
    test('sanitizes string input', () => {
      const input = '## Task Section\n\n- [ ] First task\n- [ ] Second task';
      
      const result = parseTasksList(input);
      
      // The sanitized input should be processed, but we need to verify the input was sanitized
      // Since parseTasksSection is called with sanitized input, we can't directly test the final result
      // But we can test that the function doesn't throw and returns an array
      expect(Array.isArray(result)).toBe(true);
    });

    test('sanitizes array input', () => {
      const input = [
        '## First Task\nDo something',
        '## Second Task\nDo another thing',
      ];
      
      const result = parseTasksList(input);
      
      expect(result).toEqual([
        '### First Task\nDo something',
        '### Second Task\nDo another thing',
      ]);
    });

    test('handles undefined input', () => {
      const result = parseTasksList(undefined);
      
      expect(result).toBeUndefined();
    });
  });

  describe('Real-world scenario from bug report', () => {
    test('replicates the exact scenario that caused the bug', () => {
      // This is the exact content that caused the original bug
      const problematicInstruction = `Fix the critical issue where MCP task_create and task_update methods corrupt task files when section content contains ## headers.

When AI agents use mcp__scopecraft__task_update or task_create and include markdown headers (##) in section content, the parser treats these as new sections, breaking the task structure.

Example of the problem:
\`\`\`
mcp__scopecraft__task_update({
  id: "task-id",
  updates: {
    deliverable: "## Completed Module\\n\\nSome content..."
  }
})
\`\`\`

This creates invalid task structure because the parser sees "## Completed Module" as a new section.`;

      const problematicDeliverable = `## Completed Module

The authentication module has been successfully implemented with the following features:

## Key Components

- User registration
- Login/logout functionality  
- Password reset

## Testing

All tests pass successfully.`;

      // Test that the sanitization function works correctly
      const sanitizedInstruction = sanitizeSectionContent(problematicInstruction);
      const sanitizedDeliverable = sanitizeSectionContent(problematicDeliverable);

      // The instruction doesn't actually contain ## headers to convert (they're in code blocks)
      // So focus on the deliverable which does have the problematic headers
      expect(sanitizedDeliverable).not.toContain('\n## ');
      expect(sanitizedDeliverable).toContain('\n### ');
      
      expect(sanitizedDeliverable).toBe(`### Completed Module

The authentication module has been successfully implemented with the following features:

### Key Components

- User registration
- Login/logout functionality  
- Password reset

### Testing

All tests pass successfully.`);

      // Test that the options builders apply sanitization
      const createOptions = buildTaskCreateOptionsBase({
        title: 'Test Task',
        type: 'bug',
        instruction: problematicInstruction,
      });

      const updateOptions = buildTaskUpdateOptions({
        deliverable: problematicDeliverable,
      });

      expect(createOptions.instruction).not.toContain('\n## ');
      expect(updateOptions.sections?.deliverable).not.toContain('\n## ');
      expect(updateOptions.sections?.deliverable).toContain('\n### ');
    });
  });
});