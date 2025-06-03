# Metadata Architecture Specification

## Overview

Scopecraft uses a schema-driven architecture for all metadata and configuration. This allows projects to customize their task types, statuses, priorities, and other metadata while maintaining type safety and validation across all system layers.

## Core Concepts

### Schema-Driven Configuration

All metadata definitions in Scopecraft come from JSON schemas that define:
- Valid values for enumerated fields (status, type, priority)
- Validation rules for free-form fields (tags, assignee, custom)
- Display properties for user interfaces
- Aliases for flexible input handling

### Three Categories of Configuration

1. **Enum-based Metadata**: Fixed-choice fields with defined valid values
2. **Free-form Metadata**: Open-ended fields with optional validation rules
3. **Document Structure**: Required sections enforced by config, additional sections defined by templates

## Architecture

```
┌─────────────────────────────────────────────────┐
│                Schema Registry                   │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Metadata   │ │   Document  │ │ Validation│ │
│  │   Schemas    │ │   Schemas   │ │  Rules    │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
    │ Schema  │    │ Schema  │   │ Schema  │
    │ Service │    │Validator│   │Formatter│
    └────┬────┘    └────┬────┘   └────┬────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼───┐    ┌────▼────┐   ┌────▼────┐
    │  Core  │    │   MCP   │   │   CLI   │
    │  Layer │    │  Layer  │   │  Layer  │
    └────────┘    └─────────┘   └─────────┘
```

### Schema Services

The system provides three composable services:

- **Schema Service**: Loads and merges schema definitions
- **Validation Service**: Validates values against schemas
- **Transform Service**: Handles format conversions between layers

## Schema Structure

### Enum Metadata Definition

```json
{
  "status": {
    "values": [
      {
        "name": "todo",
        "label": "To Do",
        "emoji": "📋",
        "description": "Work that hasn't started yet",
        "aliases": ["new", "open", "created"]
      },
      {
        "name": "in_progress",
        "label": "In Progress",
        "emoji": "🔵",
        "description": "Work currently being done",
        "aliases": ["wip", "working", "active"]
      }
    ],
    "default": "todo"
  },
  "type": {
    "values": [
      {
        "name": "feature",
        "label": "Feature",
        "emoji": "✨",
        "description": "New functionality to be added",
        "template": "01_feature.md"
      },
      {
        "name": "bug",
        "label": "Bug",
        "emoji": "🐛",
        "description": "Something that needs fixing",
        "template": "02_bug.md"
      }
    ],
    "default": "feature"
  }
}
```

### Field Metadata Definition

```json
{
  "tags": {
    "type": "array",
    "itemType": "string",
    "validation": {
      "maxItems": 10,
      "pattern": "^[a-z][a-z0-9-]*$"
    },
    "description": "Labels for categorization"
  },
  "assignee": {
    "type": "string",
    "validation": {
      "pattern": "^[a-z]+$"
    },
    "autocomplete": "users"
  }
}
```

### Document Structure Definition

```json
{
  "document": {
    "required_sections": ["instruction", "tasks", "deliverable", "log"],
    "template_path": "templates/"
  }
}
```

Templates control the actual document structure and can add any additional sections beyond the required ones. For example, a feature template might include "Acceptance Criteria" while a bug template might include "Steps to Reproduce".

## Configuration Hierarchy

Scopecraft loads schemas from three levels, with each level extending the previous:

1. **System Defaults**: Built-in schemas providing standard task management fields
2. **Project Configuration**: `.scopecraft/schemas/metadata.json` for project customization
3. **Runtime Options**: Configuration passed via API or CLI for temporary overrides

## Layer Responsibilities

### Core Layer
- Stores canonical names in Markdown files (e.g., "in_progress", "feature")
- Implements Map-based alias normalization for O(1) performance
- Uses Schema Service for validation and alias resolution
- Maintains data integrity and single source of truth

### MCP Layer
- Exposes flexible API accepting aliases and canonical values
- Handlers normalize input using core normalizers (aliases → canonical)
- Uses separate input/output schemas: liberal input acceptance, conservative output
- Generates dynamic Zod descriptions from schema registry
- Provides detailed validation errors with valid options
- Transformers do pure structural conversion (NO normalization, NO defaults)

### CLI Layer
- Accepts user-friendly input including aliases
- Displays formatted output with emoji and colors
- Shows helpful options on validation errors

### UI Layer
- Consumes normalized data from MCP
- Applies display formatting from schemas
- Provides rich interactions with tooltips and descriptions

## Alias Support Architecture

### Map-Based Normalization

The system uses efficient Map-based lookups for alias normalization:

```typescript
// Built from schema on first use
const normalizer = new Map([
  ['feat', 'feature'],
  ['fix', 'bug'], 
  ['wip', 'in_progress'],
  ['p2', 'high'],
  // ... all aliases from schema
]);
```

### Dual Schema Pattern (MCP)

MCP follows Postel's Law with separate schemas:

- **Input Schemas**: Accept any string, provide AI guidance with canonical examples
- **Output Schemas**: Return only canonical values for consistency
- **Dynamic Descriptions**: Generated from schema registry, never hardcoded

```typescript
// Input: Flexible validation
export const TaskTypeInputSchema = z.string().describe(
  `Task type. Use: ${getTypeValues().map(t => `"${t.name}"`).join(', ')}`
);

// Output: Strict canonical values  
export const TaskTypeSchema = z.enum(['feature', 'bug', 'chore', ...]);
```

## Validation and Transformation

### Validation Flow
1. Input received (any format/alias)
2. Normalize to canonical name
3. Validate against schema
4. Return helpful error with valid options if invalid

### Transformation Rules
- **Internal Storage**: Uses canonical names (e.g., "in_progress")
- **Display Output**: Uses labels (e.g., "In Progress")
- **User Input**: Accepts names, labels, or aliases
- **API Transport**: Uses canonical names

### Data Flow Through Layers

```
User Input → MCP Handler → Core → Storage
   "wip"    →  normalizes → stores as → "in_progress"
              to canonical   canonical

Storage → Core → MCP Transformer → API Response
"in_progress" → returns → passes through → "in_progress"
                canonical  (no normalization)
```

**Critical**: MCP transformers receive data FROM core, which is already canonical. They must NOT re-normalize or provide defaults - only convert data structures.

## Template and Type Relationship

The type metadata in the configuration links to template files that define the document structure:

1. **Configuration** defines the type exists and its metadata (label, emoji, description)
2. **Template** defines the document structure for that type
3. **Required sections** are enforced by the system
4. **Additional sections** are freely defined in templates

This separation allows:
- Fast type enumeration without file scanning
- Centralized metadata for all UI layers
- Complete flexibility in document structure per type
- Easy addition of new types by adding both config entry and template

## Task Relations

Task relations are first-class citizens in the metadata system, enabling semantic connections between tasks:

### Relation Schema

```json
{
  "relations": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "type": {
          "type": "enum",
          "values": [
            {
              "name": "blocks",
              "label": "Blocks",
              "description": "This task must be completed before the related task can start",
              "inverse": "blocked_by"
            },
            {
              "name": "depends_on",
              "label": "Depends On",
              "description": "This task requires the related task",
              "inverse": "required_by"
            },
            {
              "name": "relates_to",
              "label": "Relates To",
              "description": "This task is related but not dependent",
              "bidirectional": true
            },
            {
              "name": "parent_of",
              "label": "Parent Of",
              "description": "This task logically contains the related task",
              "inverse": "child_of"
            },
            {
              "name": "duplicates",
              "label": "Duplicates",
              "description": "This task duplicates the related task",
              "inverse": "duplicated_by"
            }
          ]
        },
        "target": {
          "type": "string",
          "description": "Task ID reference"
        },
        "description": {
          "type": "string",
          "description": "Optional context about the relationship"
        }
      }
    }
  }
}
```

### Example Usage

```yaml
---
type: feature
status: In Progress
relations:
  - type: blocks
    target: user-profile-05B
    description: Authentication must be complete first
  - type: relates_to
    target: reds-tas-con-api-for-cns-hand-05A
    description: Content API affects how we handle user data
---
```

### Relation Semantics

Relations support:
- **Inverse relationships**: Automatically maintained (e.g., if A blocks B, then B is blocked_by A)
- **Bidirectional relations**: Some relations are symmetric (e.g., relates_to)
- **Validation**: Ensures referenced tasks exist
- **Querying**: Find all tasks that block/depend on a given task
- **Visualization**: Generate dependency graphs and relationship maps

## Benefits

- **Flexibility**: Projects define their own metadata schemas and document structures
- **Consistency**: Single source of truth for all metadata
- **Type Safety**: TypeScript types generated from schemas
- **User Friendly**: Accepts variations, shows helpful errors
- **Extensible**: Easy to add new metadata types and templates
- **Composable**: Services work independently and together
- **Separation of Concerns**: Metadata in config, document structure in templates
- **Relationship Tracking**: First-class support for task dependencies and connections

## Example Project Schema

```json
{
  "extends": "scopecraft:default",
  "metadata": {
    "enums": {
      "status": {
        "values": [
          {
            "name": "backlog",
            "label": "Backlog",
            "emoji": "📚",
            "description": "Prioritized for future work"
          }
        ]
      },
      "type": {
        "values": [
          {
            "name": "spike",
            "label": "Research Spike",
            "emoji": "🔬",
            "description": "Time-boxed research task",
            "template": "06_spike.md"
          }
        ]
      }
    }
  },
  "document": {
    "required_sections": ["instruction", "tasks", "findings", "log"]
  }
}
```

This schema:
- Extends the default Scopecraft schemas
- Adds a new "backlog" status
- Adds a custom "spike" type with its own template
- Changes required sections to include "findings" instead of "deliverable"

The system automatically merges these with defaults and makes them available throughout all layers. The spike template can then define additional sections like "Research Questions" or "Resources" beyond the required sections.