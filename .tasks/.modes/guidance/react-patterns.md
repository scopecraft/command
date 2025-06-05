# React Patterns Guidance

## When This Applies
When working with React components, hooks, state management, or making React architecture decisions.

## Key Considerations

### Component Design Philosophy
- What problem does this component solve?
- Who will use it and how?
- Should it be controlled or uncontrolled?
- How will it compose with other components?
- What's the simplest implementation that works?

### State Management Decisions
- Where should this state live? (Local, lifted, or global)
- Is this UI state or server state?
- How frequently does it change?
- Who needs access to it?
- What happens on refresh?

### Performance Considerations
- Start with the simplest implementation
- Measure before optimizing
- Consider the actual user impact
- Balance developer experience with performance

### Modern React Patterns
- Hooks for logic reuse and composition
- Context for cross-cutting concerns
- Suspense for async operations
- Error boundaries for resilience

## Research Strategies

### Understanding React Patterns
1. **Identify the Pattern Type**
   - Structural (how components organize)
   - Behavioral (how components interact)
   - Creational (how components are made)

2. **Research Sources**
   - Official React documentation
   - Popular library implementations
   - Community best practices
   - Team conventions

3. **Evaluation Criteria**
   - Simplicity and readability
   - Testability
   - Performance implications
   - Maintenance burden

### Research Approaches
- **Library Documentation**: Use Context7 for any React library or package you encounter - crucial for understanding APIs, patterns, and best practices
- **Community Knowledge**: Search for pattern examples and discussions  
- **Codebase Analysis**: Use Read, Grep, and Glob to examine existing patterns

## Pattern Categories

### Composition Patterns
- Component composition over inheritance
- Render props for flexible rendering
- Higher-order components for behavior
- Custom hooks for logic sharing

### State Patterns
- Lifting state to common ancestors
- State machines for complex flows
- Optimistic updates for responsiveness
- URL state for shareable UI

### Data Flow Patterns
- Props for parent-child communication
- Context for deeply nested data
- Events for child-parent communication
- External stores for complex state

### Error Handling Patterns
- Error boundaries for component trees
- Fallback UI for graceful degradation
- Retry mechanisms for transient failures
- User-friendly error messages

## Patterns to Follow

### Component Organization
```typescript
// 1. Types/interfaces at the top
interface ComponentProps {
  // Props
}

// 2. Styled components or CSS modules
const StyledContainer = styled.div`...`;

// 3. Subcomponents
const SubComponent = () => {...};

// 4. Main component
export function MainComponent({ prop1, prop2 }: ComponentProps) {
  // 5. Hooks first
  const [state, setState] = useState();
  const { data } = useQuery();
  
  // 6. Event handlers
  const handleClick = () => {};
  
  // 7. Effects
  useEffect(() => {}, []);
  
  // 8. Render
  return <div>...</div>;
}
```

### State Update Patterns
```typescript
// Prefer functional updates for state depending on previous value
setState(prev => ({ ...prev, newField: value }));

// Batch updates naturally happen in React 18+
handleClick = () => {
  setState1(value1);
  setState2(value2); // Single re-render
};
```

### Error Handling
```typescript
// Use error boundaries for component trees
<ErrorBoundary fallback={<ErrorUI />}>
  <ComponentTree />
</ErrorBoundary>

// Handle async errors properly
try {
  await apiCall();
} catch (error) {
  setError(error);
  // Log to error reporting service
}
```

## Common Pitfalls

### Performance Issues
- Inline function definitions causing re-renders
- Missing dependency arrays in hooks
- Large component trees without memo boundaries
- Fetching in useEffect without cleanup

### State Management
- Prop drilling instead of composition or context
- Overusing context for frequently changing values
- Not considering URL state for shareable UI state
- Mixing controlled and uncontrolled inputs

### Modern React Mistakes
- Using client components when server components would work
- Not leveraging Suspense for loading states
- Fetching on client when server-side would be better
- Over-engineering when native HTML would suffice

## Scopecraft-Specific Considerations

Given Scopecraft's dark terminal aesthetic and developer focus:
- Prefer keyboard navigation patterns
- Consider terminal-like interactions (command palette)
- Use monospace fonts for code/data display
- Implement vim-like keybindings where appropriate
- Focus on information density over whitespace