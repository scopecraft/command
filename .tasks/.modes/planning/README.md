# Planning Mode

Breaks down ideas and features into actionable tasks for the AI army.

## Philosophy

One developer + AI army = Need smart task breakdown that:
- Identifies what can be done in parallel
- Knows when to explore vs implement
- Creates review gates where human input matters
- Keeps simple things simple

## Files

### base.md
Entry point - takes a feature description and creates appropriate tasks.

### adaptive.md  
The brain - assesses complexity and generates the right task structure:
- **Too vague?** → Creates a brainstorming task
- **Simple?** → One comprehensive task
- **Medium?** → Standard sequence of tasks
- **Complex?** → Research + prototypes + review gates
- **Huge?** → Multi-phase initiative

## Usage

```bash
# Turn an idea into tasks
channelcoder .tasks/.modes/planning/base.md \
    -d feature_description="Add dark mode toggle" \
    -d area="ui"

# Or go directly to adaptive planning
channelcoder .tasks/.modes/planning/adaptive.md \
    -d feature_description="Build real-time collaboration" \
    -d area="ui"
```

## Examples

**Simple**: "Add logout button" → One task with everything
**Medium**: "Add OAuth login" → Research, design, implement, test
**Complex**: "Real-time collab" → Multiple research paths, prototypes, iterative development