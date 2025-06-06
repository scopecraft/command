# Fix Storybook router context and theme issues

---
type: bug
status: todo
area: ui
tags:
  - storybook
  - bug
  - router
  - theme
  - tanstack
  - interactive
priority: highest
---


## Instruction
Fix two remaining Storybook issues that are preventing stories from working properly.

### Issue 1: TanStack Router Context Missing in Storybook
```
useRouterState@http://localhost:6006/.../sb-vite/deps/@tanstack_react-router.js?v=02b9a616:4029:19
useLinkProps@http://localhost:6006/.../sb-vite/deps/@tanstack_react-router.js?v=02b9a616:4783:39
Link<@http://localhost:6006/.../sb-vite/deps/@tanstack_react-router.js?v=02b9a616:4999:21
```

**Context**: Multiple components are using TanStack Router's `Link` component and hooks (`useNavigate`, `useRouterState`, etc.) but Storybook doesn't provide a router context by default.

### Issue 2: Hardcoded Colors in SectionEditor
The SectionEditor component has hardcoded color values that don't properly integrate with the theme system. This causes issues when switching between dark and light modes in Storybook.

### Requirements

#### For Router Issue:
1. Create a proper TanStack Router mock/decorator for Storybook
2. Provide all necessary router context for components
3. Mock navigation functions appropriately
4. Ensure all router-dependent components work in isolation

#### For Theme Issue:
1. Identify all hardcoded colors in SectionEditor
2. Replace with theme-aware CSS variables or classes
3. Ensure proper dark/light mode support
4. Test in both themes at http://localhost:6006/

### Success Criteria
- All Storybook stories load without router errors
- Components using router work properly in stories
- SectionEditor looks correct in both dark and light themes
- No hardcoded colors remain in the component

### Interactive Session Notes
- This will be handled in an interactive session
- Focus on understanding the router context structure first
- Test incrementally as fixes are applied

## Tasks
- [ ] Analyze TanStack Router usage in components
- [ ] Create RouterDecorator for Storybook
- [ ] Mock necessary router functions and state
- [ ] Apply router context to all affected stories
- [ ] Test all router-dependent components
- [ ] Identify hardcoded colors in SectionEditor
- [ ] Replace colors with theme variables
- [ ] Test SectionEditor in dark/light modes
- [ ] Verify all stories work at http://localhost:6006/

## Deliverable

## Log
