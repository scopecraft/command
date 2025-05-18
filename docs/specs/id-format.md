# Task ID Format Specification

This document describes the concise task ID format introduced to replace timestamp-based IDs.

## Format

The concise ID format is: `{TYPE}-{CONTEXT}-{MMDD}-{XX}`

### Components

1. **TYPE**: Task type prefix (2-6 characters)
   - `FEAT` - Feature/Implementation
   - `BUG` - Bug fix
   - `CHORE` - Chore/Maintenance
   - `DOC` - Documentation
   - `TEST` - Test
   - `PERF` - Performance
   - `SEC` - Security
   - `STYLE` - Style/Formatting
   - `CONFIG` - Configuration
   - `REFACT` - Refactor
   - `SPIKE` - Spike/Research
   - `TASK` - Generic task (fallback)

2. **CONTEXT**: Meaningful words from task title (0-10 characters)
   - Extracted from task title after removing stop words
   - Concatenated without separators
   - Uppercase
   - Example: "Fix user authentication" → "FIXUSER"

3. **MMDD**: Date component
   - Current month (MM) and day (DD)
   - Provides temporal context
   - Example: May 18 → "0518"

4. **XX**: Random suffix (2 characters)
   - Alphanumeric characters
   - Ensures uniqueness
   - Excludes confusing characters (0/O, 1/l)
   - Character set: `0123456789ABCDEFGHJKLMNPQRSTUVWXYZ`

## Examples

- `FEAT-USERAUTH-0518-K3` - Feature for user authentication on May 18
- `BUG-LOGIN-1231-9Z` - Bug fix for login on December 31
- `TASK-0101-AA` - Generic task on January 1 (no context)

## Configuration

The ID format can be configured in `.tasks/config/project.toml`:

```toml
idFormat = "concise"  # or "timestamp" for old format
customStopWords = ["custom", "words"]
maxContextLength = 2  # Number of words to extract (1-5)
```

## Commands

```bash
# Enable concise ID format
sc config id-format concise

# Configure stop words
sc config stop-words "custom,specific,words"

# Set context length
sc config context-length 3

# Show current configuration
sc config show
```

## Migration

To migrate existing timestamp-based IDs to the new format:

```bash
# Preview changes (dry run)
sc config migrate-ids

# Apply changes
sc config migrate-ids --apply
```

## Backwards Compatibility

- Old timestamp IDs continue to work
- Both formats are validated when looking up tasks
- No breaking changes to existing workflows

## Implementation

The ID generator:
1. Extracts task type from metadata
2. Processes title to extract context words
3. Formats current date as MMDD
4. Generates random suffix
5. Combines components with hyphens
6. Validates uniqueness and retries if collision detected