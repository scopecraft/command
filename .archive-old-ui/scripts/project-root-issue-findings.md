# Project Root Context Switching Issue Analysis

After thorough investigation of the code, I've found that most of the necessary implementation for project root context switching is already in place, but there still seems to be an issue with the front-end application not consistently respecting the rootId from the URL.

## What's Working Correctly

1. **API Support**: The server-side API correctly handles `root_id` parameters. When we tested with httpie directly passing `root_id=e2e`, we got the correct tasks from the e2e_test folder.

2. **TaskContext Implementation**: The TaskContext component correctly:
   - Uses the useProjectRoot hook to get rootId from URL parameters
   - Passes rootId to all API function calls (fetchTasks, saveTask, removeTask, moveTask)
   - Re-fetches tasks when rootId changes using it in the useEffect dependency array

3. **ProjectRootSelector Component**: The component correctly:
   - Fetches available project roots from the API
   - Updates the URL via switchProjectRoot when a root is selected
   - Shows only when multiple roots are available

4. **Routing Setup**: App.tsx has proper route definitions for both with and without project root context

## Remaining Issues

1. **Route vs State Synchronization**: When navigating to a URL like `http://localhost:9999/e2e/tasks`, the UI still shows tasks from the default project instead of the 'e2e' project.

2. **Request Inspection**: When monitoring the console network requests, the rootId parameter isn't being added to some API calls, despite being in the URL.

## Possible Causes

1. **Race Condition**: There might be a race condition where tasks are fetched before the rootId is parsed from the URL.

2. **Context Provider Order**: The AppProviders component might need to be adjusted to ensure useProjectRoot is available to all providers.

3. **Missing Context In Other Providers**: While TaskContext correctly uses rootId, the FeatureContext, AreaContext, and PhaseContext components might need similar updates.

## Recommended Next Steps

1. Add debug logging to track rootId flow through the application

2. Update all context providers (Feature, Area, Phase) to use rootId from URL similar to TaskContext

3. Consider reorganizing the provider hierarchy to ensure rootId from URL is always available first

4. Verify that the UIContext activeRootId and the URL rootId stay in sync

5. Check if there are any caching issues or stale state after changing the URL

This issue shows the classic challenges with having multiple sources of truth in a React application. The URL parameters and the UI state need to be better synchronized to ensure consistent behavior.