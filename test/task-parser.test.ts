import { describe, expect, it } from 'bun:test';
import { formatTaskFile, parseTaskFile } from '../src/core/task-parser.js';
import type { Task } from '../src/core/types.js';

describe('Task Parser - Dual Format Support', () => {
  describe('parseTaskFile', () => {
    it('should parse YAML frontmatter correctly', () => {
      const yamlContent = `---
id: TASK-001
title: Test Task
type: mdtm_feature
status: 🟡 To Do
priority: 🔼 High
created_date: 2025-05-24
tags:
  - test
  - yaml
---

# Test Task

This is a test task with YAML frontmatter.`;

      const result = parseTaskFile(yamlContent);

      expect(result.metadata.id).toBe('TASK-001');
      expect(result.metadata.title).toBe('Test Task');
      expect(result.metadata.type).toBe('mdtm_feature');
      expect(result.metadata.status).toBe('🟡 To Do');
      expect(result.metadata.priority).toBe('🔼 High');
      expect(result.metadata.created_date).toBe('2025-05-24');
      expect(result.metadata.tags).toEqual(['test', 'yaml']);
      expect(result.content).toContain('This is a test task with YAML frontmatter.');
    });

    it('should parse TOML frontmatter correctly (legacy)', () => {
      const tomlContent = `+++
id = "TASK-002"
title = "Legacy Task"
type = "mdtm_bug"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-24"
tags = ["test", "toml"]
+++

# Legacy Task

This is a test task with TOML frontmatter.`;

      const result = parseTaskFile(tomlContent);

      expect(result.metadata.id).toBe('TASK-002');
      expect(result.metadata.title).toBe('Legacy Task');
      expect(result.metadata.type).toBe('mdtm_bug');
      expect(result.metadata.status).toBe('🟡 To Do');
      expect(result.metadata.priority).toBe('▶️ Medium');
      expect(result.metadata.created_date).toBe('2025-05-24');
      expect(result.metadata.tags).toEqual(['test', 'toml']);
      expect(result.content).toContain('This is a test task with TOML frontmatter.');
    });

    it('should extract title from content if missing in metadata', () => {
      const yamlContent = `---
id: TASK-003
type: mdtm_feature
---

# Title from Content

Task description here.`;

      const result = parseTaskFile(yamlContent);
      expect(result.metadata.title).toBe('Title from Content');
    });

    it('should handle single tag as array in YAML', () => {
      const yamlContent = `---
id: TASK-004
title: Single Tag Test
tags: single-tag
---

Content`;

      const result = parseTaskFile(yamlContent);
      expect(result.metadata.tags).toEqual(['single-tag']);
    });

    it('should normalize date formats', () => {
      const yamlContent = `---
id: TASK-005
title: Date Test
created_date: 2025-05-24T10:30:00Z
updated_date: "2025-05-25"
---

Content`;

      const result = parseTaskFile(yamlContent);
      expect(result.metadata.created_date).toBe('2025-05-24');
      expect(result.metadata.updated_date).toBe('2025-05-25');
    });

    it('should throw error for missing frontmatter', () => {
      const invalidContent = `# Just a heading

No frontmatter here.`;

      expect(() => parseTaskFile(invalidContent)).toThrow('No valid frontmatter found');
    });

    it('should throw error for missing required id field', () => {
      const yamlContent = `---
title: No ID Task
type: mdtm_feature
---

Content`;

      expect(() => parseTaskFile(yamlContent)).toThrow('Missing required field: id');
    });

    it('should handle empty content', () => {
      const yamlContent = `---
id: TASK-006
title: Empty Content
---

`;

      const result = parseTaskFile(yamlContent);
      expect(result.content).toBe('');
    });
  });

  describe('formatTaskFile', () => {
    it('should always format as YAML frontmatter', () => {
      const task: Task = {
        metadata: {
          id: 'TASK-007',
          title: 'YAML Output Test',
          type: 'mdtm_feature',
          status: '🟡 To Do',
          priority: '🔼 High',
          created_date: '2025-05-24',
          tags: ['test', 'output'],
        },
        content: '# YAML Output Test\n\nThis should be formatted with YAML frontmatter.',
      };

      const result = formatTaskFile(task);

      expect(result).toStartWith('---');
      expect(result).toContain('id: TASK-007');
      expect(result).toContain('title: YAML Output Test');
      expect(result).toContain('tags:\n  - test\n  - output');
      expect(result).toContain('# YAML Output Test');
    });

    it('should remove undefined fields', () => {
      const task: Task = {
        metadata: {
          id: 'TASK-008',
          title: 'Clean Task',
          due_date: undefined,
          assignee: undefined,
        },
        content: 'Content',
      };

      const result = formatTaskFile(task);

      expect(result).not.toContain('due_date');
      expect(result).not.toContain('assignee');
      expect(result).not.toContain('undefined');
    });

    it('should handle empty content', () => {
      const task: Task = {
        metadata: {
          id: 'TASK-009',
          title: 'Empty Content Task',
        },
        content: '',
      };

      const result = formatTaskFile(task);

      expect(result).toStartWith('---');
      expect(result).toContain('id: TASK-009');
      expect(result).toEndWith('\n');
    });

    it('should ensure trailing newline', () => {
      const task: Task = {
        metadata: {
          id: 'TASK-010',
          title: 'Newline Test',
        },
        content: 'Content without newline',
      };

      const result = formatTaskFile(task);
      expect(result).toEndWith('\n');
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain data integrity when converting TOML to YAML', () => {
      const tomlContent = `+++
id = "TASK-011"
title = "Round Trip Test"
type = "mdtm_feature"
status = "🔵 In Progress"
priority = "🔼 High"
created_date = "2025-05-24"
updated_date = "2025-05-25"
tags = ["backend", "api", "test"]
depends = ["TASK-010", "TASK-009"]
assignee = "john.doe"
+++

# Round Trip Test

This task tests the round-trip conversion from TOML to YAML.

## Details

- Item 1
- Item 2
- Item 3`;

      // Parse TOML
      const parsed = parseTaskFile(tomlContent);

      // Format as YAML
      const yamlOutput = formatTaskFile(parsed);

      // Parse the YAML output
      const reparsed = parseTaskFile(yamlOutput);

      // Compare metadata
      expect(reparsed.metadata).toEqual(parsed.metadata);
      expect(reparsed.content).toBe(parsed.content);
    });

    it('should handle special characters in content', () => {
      const task: Task = {
        metadata: {
          id: 'TASK-012',
          title: 'Special Characters',
        },
        content: `# Special Characters

Content with "quotes" and 'apostrophes'.
Also: colons, dashes---and special chars like @#$%^&*()`,
      };

      const formatted = formatTaskFile(task);
      const parsed = parseTaskFile(formatted);

      expect(parsed.metadata).toEqual(task.metadata);
      expect(parsed.content).toBe(task.content);
    });
  });

  describe('Error handling', () => {
    it('should provide clear error for invalid YAML', () => {
      const invalidYaml = `---
id: TASK-013
title: Invalid YAML
tags: [unclosed array
---

Content`;

      expect(() => parseTaskFile(invalidYaml)).toThrow('Failed to parse YAML frontmatter');
    });

    it('should provide clear error for invalid TOML', () => {
      const invalidToml = `+++
id = "TASK-014"
title = Invalid TOML"
+++

Content`;

      expect(() => parseTaskFile(invalidToml)).toThrow('Failed to parse TOML frontmatter');
    });
  });
});
