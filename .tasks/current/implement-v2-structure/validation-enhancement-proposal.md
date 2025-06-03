# Validation Enhancement Proposal

## Current State
The core validation only checks for required fields but doesn't validate enum values. Invalid values are silently normalized to defaults:
- Invalid type → "chore"
- Invalid status → "todo"  
- Invalid priority → "medium"

## Recommendation
While the current approach follows Postel's Law (accept liberally), we should provide warnings for unrecognized values to help users catch typos.

## Proposed Enhancement
```typescript
// In normalizeFrontmatter, track normalization changes
const warnings: string[] = [];

if (normalized.type) {
  const original = normalized.type;
  normalized.type = normalizeTaskType(original);
  if (original !== normalized.type && !isKnownTypeVariation(original)) {
    warnings.push(`Unrecognized type "${original}" normalized to "${normalized.type}"`);
  }
}

// Return warnings alongside the normalized data
```

## Benefits
- Users get feedback on typos ("feture" → "feature" with warning)
- Still accepts variations ("feat" → "feature" without warning)
- Maintains liberal acceptance while improving user experience

## Implementation Complexity
- Medium: Requires changing return types to include warnings
- Could be done as a follow-up enhancement