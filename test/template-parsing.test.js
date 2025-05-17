/**
 * Tests for template parsing and application
 */
// Use direct import from source instead of compiled output
const { applyTemplate } = require('../src/core/template-manager.js');
const { parseTaskFile } = require('../src/core/task-parser.js');
const assert = require('node:assert');

describe('Template parsing', () => {
  it('should handle empty id in template', () => {
    // Template with empty id
    const templateContent = `+++
id = ""
title = ""
status = "🟡 To Do"
+++

# [Title]

Task description
`;

    const values = {
      id: 'TASK-123',
      title: 'Test Task',
      type: '🌟 Feature',
    };

    const appliedTemplate = applyTemplate(templateContent, values);

    // Should have successfully applied the ID
    assert.ok(
      appliedTemplate.includes(`id = "TASK-123"`),
      'Applied template should include the ID'
    );

    try {
      // Should be able to parse without error
      const task = parseTaskFile(appliedTemplate);
      assert.strictEqual(task.metadata.id, 'TASK-123', 'Task should have correct ID');
    } catch (error) {
      assert.fail(`Failed to parse task: ${error.message}`);
    }
  });

  it('should forcibly add ID field even if missing from template', () => {
    // Template without id field at all
    const templateContent = `+++
title = ""
status = "🟡 To Do"
+++

# [Title]

Task description
`;

    const values = {
      id: 'TASK-ABC',
      title: 'Missing ID Task',
      type: '🌟 Feature',
    };

    const appliedTemplate = applyTemplate(templateContent, values);

    // Should have forcibly added the ID field
    assert.ok(
      appliedTemplate.includes(`id = "TASK-ABC"`),
      'Applied template should include the added ID'
    );

    try {
      // Should be able to parse without error
      const task = parseTaskFile(appliedTemplate);
      assert.strictEqual(task.metadata.id, 'TASK-ABC', 'Task should have correct ID');
    } catch (error) {
      assert.fail(`Failed to parse task: ${error.message}`);
    }
  });

  it('should handle multiple placeholders and complex templates', () => {
    // Complex template with multiple fields
    const templateContent = `+++
id = ""
title = ""
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = ""
updated_date = ""
assigned_to = ""
tags = []
+++

# Bug Summary

## Description

What is the problem?
`;

    const values = {
      id: 'TASK-BUG-001',
      title: 'Test Bug',
      status: '🔵 In Progress',
      type: '🐞 Bug',
      priority: '🔼 High',
      created_date: '2025-05-12',
      updated_date: '2025-05-12',
      assigned_to: 'David',
      tags: ['test', 'bug'],
      content: 'Custom content here',
    };

    const appliedTemplate = applyTemplate(templateContent, values);

    // Should have successfully applied all fields
    assert.ok(
      appliedTemplate.includes(`id = "TASK-BUG-001"`),
      'Applied template should include the ID'
    );
    assert.ok(
      appliedTemplate.includes(`status = "🔵 In Progress"`),
      'Applied template should include the status'
    );
    assert.ok(
      appliedTemplate.includes(`priority = "🔼 High"`),
      'Applied template should include the priority'
    );
    assert.ok(
      appliedTemplate.includes(`type = "🐞 Bug"`),
      'Applied template should include the type'
    );
    // TOML stringify will use a different format for arrays, so we check for both possible formats
    const hasTags =
      appliedTemplate.includes(`tags = ["test", "bug"]`) ||
      appliedTemplate.includes(`tags = [ "test", "bug" ]`) ||
      appliedTemplate.includes(`tags = ["test","bug"]`);
    assert.ok(hasTags, 'Applied template should include the tags');
    assert.ok(
      appliedTemplate.includes('Custom content here'),
      'Applied template should include custom content'
    );

    try {
      // Should be able to parse without error
      const task = parseTaskFile(appliedTemplate);
      assert.strictEqual(task.metadata.id, 'TASK-BUG-001', 'Task should have correct ID');
      assert.strictEqual(task.metadata.status, '🔵 In Progress', 'Task should have correct status');
      assert.strictEqual(task.metadata.assigned_to, 'David', 'Task should have correct assignee');
      assert.deepStrictEqual(task.metadata.tags, ['test', 'bug'], 'Task should have correct tags');
    } catch (error) {
      assert.fail(`Failed to parse task: ${error.message}`);
    }
  });
});
