# Schema Validation Implementation Proposal

## Current State
- Schema Service exists and provides metadata definitions
- Normalizers always return valid defaults (Postel's Law)
- No validation service exists yet as described in architecture

## Architecture Intent
From metadata-architecture.md:
- Core Layer uses Schema Service for validation (line 154)
- Three composable services should exist (line 52-57):
  - Schema Service ✅ (implemented)
  - Validation Service ❌ (missing)
  - Transform Service ❌ (missing)

## Current Implementation Choice
For task 16, I've added validation to normalizeFrontmatter that:
1. Normalizes input using existing normalizers
2. Validates normalized values against schema
3. Throws clear errors with valid options if invalid

This provides immediate validation without requiring full service implementation.

## Future Enhancement Path
1. Extract validation logic into a proper ValidationService
2. Create TransformService for format conversions
3. Make services composable as intended
4. MCP layer can then generate Zod schemas from these services

## Benefits of Current Approach
- Provides validation immediately 
- Uses existing schema service
- Minimal changes required
- Can be refactored into services later

## Example of Future Service
```typescript
// Future ValidationService
export class ValidationService {
  constructor(private schemaService: SchemaService) {}
  
  validateFrontmatter(data: unknown): ValidationResult {
    // Use schema service to validate
    // Return errors or normalized data
  }
  
  // Generate Zod schema for MCP layer
  generateZodSchema(): z.ZodSchema {
    // Convert metadata definitions to Zod
  }
}
```