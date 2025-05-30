# Refactor worktree dashboard for V2

---
type: feature
status: To Do
area: ui
priority: Medium
tags:
  - ui
  - v2
  - worktree
  - refactor
  - git
---


## Instruction

Refactor and improve the worktree dashboard functionality for the V2 UI. The current V1 implementation works but needs architectural improvements and better integration with the V2 design system.

### Background
- V1 has WorktreeDashboard, WorktreeCard, FeatureProgress, and related components
- Provides visualization of git worktrees for parallel development
- Shows task progress and git status for each worktree
- Needs refactoring to improve code organization and UX

### Current Issues to Address
- Component architecture could be cleaner
- State management needs improvement
- UI doesn't match V2 design language
- Performance could be optimized
- Missing some useful features (search, filtering)

### Integration Points
- Git worktree API endpoints
- Task system for showing related tasks
- Real-time updates for git status
- Navigation to task details from worktree view

## Tasks

- [ ] Analyze current worktree implementation
  - [ ] Document current architecture and pain points
  - [ ] Identify reusable components
  - [ ] List missing features
  - [ ] Performance audit
- [ ] Design improved architecture
  - [ ] Component hierarchy
  - [ ] State management approach
  - [ ] Data fetching strategy
  - [ ] Real-time update mechanism
- [ ] Refactor components
  - [ ] Create clean WorktreeDashboard component
  - [ ] Implement WorktreeCard with V2 design
  - [ ] Add progress visualization
  - [ ] Integrate with V2 component library
- [ ] Add new features
  - [ ] Search/filter worktrees
  - [ ] Bulk actions
  - [ ] Better status indicators
  - [ ] Quick actions (switch, delete, etc.)
- [ ] Integrate with V2 routing
  - [ ] Add /worktree routes
  - [ ] Add to sidebar navigation
  - [ ] Deep linking support
- [ ] Testing and optimization
  - [ ] Performance optimization
  - [ ] Error handling
  - [ ] Loading states
  - [ ] Empty states

## Deliverable

- Refactored worktree dashboard with clean architecture
- Improved UX with V2 design system integration
- Better performance and real-time updates
- New features like search and filtering
- Seamless integration with task management
- Documentation of the new architecture

## Log
- 2025-05-30: Task created to track worktree dashboard refactoring for V2