# MCP Prompt Guidelines

This document provides comprehensive guidelines for creating effective prompts and improving user experience when working with Model Context Protocol (MCP) tools in AI assistants like Claude.

## Table of Contents

1. [Introduction](#introduction)
2. [Core Principles](#core-principles)
3. [User Experience Guidelines](#user-experience-guidelines)
4. [Prompt Patterns](#prompt-patterns)
5. [Error Handling](#error-handling)
6. [Optimization Techniques](#optimization-techniques)
7. [Examples](#examples)

## Introduction

The Model Context Protocol (MCP) allows AI assistants to interact with external tools and data sources through standardized interfaces. While MCP provides powerful capabilities, the JSON structure of responses can create a disconnect in the user experience if not properly handled.

These guidelines aim to bridge that gap, ensuring that MCP tool interactions remain transparent to users while maintaining the conversational flow.

## Core Principles

When using MCP tools, follow these core principles:

1. **Transparency**: Make it clear what actions are being taken and why
2. **Context Preservation**: Maintain conversational context through tool calls
3. **User Control**: Allow users to approve significant changes
4. **Efficiency**: Use the most token-efficient approach for each interaction
5. **Human-Centric**: Translate machine responses into natural language
6. **Error Resilience**: Handle errors gracefully and suggest alternatives

## User Experience Guidelines

### 1. Clear Summarization After Tool Use

Always provide a clear human-readable summary after using an MCP tool:

✅ **Good Example:**
```
I've updated the task status to 'In Progress' and added two new checklist items to track the refactoring steps.
```

❌ **Poor Example:**
```
{"success": true, "data": {"metadata": {"id": "TASK-123", "status": "🔵 In Progress"...}}}
```

### 2. Before/After Comparisons for Content Updates

When updating content, summarize what has changed:

✅ **Good Example:**
```
I've updated the task description. Changes:
- Added detailed refactoring strategies
- Expanded testing approach with 3 new methods
- Added implementation checklist
```

❌ **Poor Example:**
```
Task updated successfully.
```

### 3. Progressive Disclosure of Complex Information

Layer information based on complexity:

✅ **Good Example:**
```
Task updated! I've marked it as high priority and added implementation details.

Would you like to see the full list of changes?
```

❌ **Poor Example:**
```
[Dumps all JSON data or provides no context]
```

### 4. Visual Cues for Actions

Use formatting to distinguish actions:

✅ **Good Example:**
```
📝 *Creating task...*
✅ Task "Refactor task-manager.ts" created with ID TASK-123
```

❌ **Poor Example:**
```
Task created with ID TASK-123
```

### 5. Confirmation for Important Changes

Confirm important changes with users:

✅ **Good Example:**
```
I'll update the task status to 'Completed'. This will remove it from the active tasks list. Should I proceed?
```

❌ **Poor Example:**
```
[Makes change without confirmation]
```

### 6. Efficient Tool Usage

Optimize tool calls for performance:

✅ **Good Example:**
```
// Only update the specific metadata fields needed
mcp__scopecraft-cmd__task_update {
  "id": "TASK-123",
  "updates": {
    "metadata": {
      "status": "🔵 In Progress"
    }
  }
}
```

❌ **Poor Example:**
```
// Gets the full task first even when not needed
mcp__scopecraft-cmd__task_get { "id": "TASK-123" }
// Then updates with the full content unnecessarily
mcp__scopecraft-cmd__task_update { ... full task content ... }
```

### 7. Error Handling

Handle errors gracefully and provide context:

✅ **Good Example:**
```
I encountered an error when trying to update the task: "Task with ID TASK-123 not found". 
Let me check if the task ID is correct or if we need to create a new task.
```

❌ **Poor Example:**
```
Error: {"success":false,"error":"Task with ID TASK-123 not found"}
```

## Prompt Patterns

### Task Creation Prompts

When creating tasks, use these patterns:

1. **Information Gathering**:
   ```
   To create a task, I'll need some information:
   1. What's the title of the task?
   2. What type of task is it? (Feature, Bug, etc.)
   3. What priority would you give it?
   4. Which phase should it be assigned to?
   ```

2. **Confirmation Before Creation**:
   ```
   I'll create a task with the following details:
   - Title: "Implement user authentication"
   - Type: 🌟 Feature
   - Priority: 🔼 High
   - Phase: release-v1
   
   Does this look correct?
   ```

3. **Creation Acknowledgment**:
   ```
   ✅ Task created successfully!
   ID: TASK-20250513T123456
   Title: Implement user authentication
   Status: 🟡 To Do
   
   Would you like me to add more details to the task description?
   ```

### Task Update Prompts

When updating tasks, use these patterns:

1. **Targeted Updates**:
   ```
   I'll update just the status of the task to "In Progress".
   ```

2. **Content Modification Summary**:
   ```
   I'll add the following to the task description:
   - Implementation details section
   - Testing requirements
   - Dependency information
   ```

3. **Post-Update Summary**:
   ```
   ✅ Task updated successfully!
   
   Changes made:
   - Status changed from "To Do" to "In Progress"
   - Added 3 new checklist items
   - Updated implementation details
   ```

### Template Usage Prompts

When working with templates, use these patterns:

1. **Template Discovery Pattern**:
   ```
   I'll find available templates for your task.

   *Calling template_list...*
   ✅ Available templates: feature, bug, documentation, chore, test

   What type of task would you like to create?
   ```

2. **Template Selection Confirmation Pattern**:
   ```
   I'll use the "feature" template for creating your task. This will include:
   - Standard feature task metadata
   - Checklist for implementation
   - Areas for acceptance criteria

   Does this sound right for your "Authentication System" task?
   ```

3. **Template-Based Creation Acknowledgment Pattern**:
   ```
   📝 *Creating task from feature template...*
   ✅ Task "Authentication System" created with ID TASK-20250513T123456

   The template has added standard sections for:
   - Description
   - Implementation checklist
   - Acceptance criteria

   Would you like me to customize any of these sections further?
   ```

## Error Handling

### Common Error Scenarios

1. **Task Not Found**:
   ```
   I couldn't find a task with ID "TASK-123". Let's check:
   
   1. Is the ID correct? (IDs are usually in the format TASK-YYYYMMDDTHHMMSS)
   2. Has the task been deleted?
   3. Would you like me to list available tasks instead?
   ```

2. **Invalid Fields**:
   ```
   I encountered an error: The status "Pending" is not valid.
   
   Valid status values are:
   - 🟡 To Do
   - 🔵 In Progress
   - 🟢 Done
   - ⚪ Blocked
   
   Which one should I use?
   ```

3. **Network/Server Errors**:
   ```
   I'm having trouble connecting to the MCP server. This might be due to:
   
   1. The server is not running
   2. There's a network issue
   
   Would you like me to try again or use the CLI commands instead?
   ```

## Optimization Techniques

### Token Efficiency

1. **Selective Field Updates**:
   - Only include fields that need to be changed
   - Avoid retrieving full task content when only updating metadata

2. **Batching Related Operations**:
   - Use batch operations when performing multiple related updates
   - Combine read operations when possible

3. **Tool Selection**:
   - Use direct file editing for extensive content changes
   - Use MCP tools for metadata and relationship updates

### Performance Considerations

1. **Minimize Round Trips**:
   - Gather all necessary information before making tool calls
   - Avoid unnecessary get-then-update sequences

2. **Caching Information**:
   - Keep track of recently accessed information
   - Use remembered data when appropriate to avoid redundant calls

## Examples

### Example 1: Creating a New Task

```
User: I need to create a task for implementing the new authentication feature.