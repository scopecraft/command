# Enhanced Feature and Area Support in CLI and MCP

This PR adds comprehensive support for MDTM feature and area directories within both the CLI and MCP interfaces, improving how features and areas are created, managed, and displayed.

## Features Added

1. **Core Functionality**
   - Added data structures for Feature and Area in `types.ts`
   - Implemented feature management functions in `task-manager.ts`:
     - `listFeatures()`, `getFeature()`, `createFeature()`, `updateFeature()`, `deleteFeature()`
   - Implemented area management functions:
     - `listAreas()`, `getArea()`, `createArea()`, `updateArea()`, `deleteArea()`
   - Added task movement functionality with `moveTask()`
   - Enhanced overview file handling

2. **MCP Interface**
   - Added new MCP methods for feature management:
     - `feature_list`, `feature_get`, `feature_create`, `feature_update`, `feature_delete`
   - Added new MCP methods for area management:
     - `area_list`, `area_get`, `area_create`, `area_update`, `area_delete`
   - Added `task_move` method for moving tasks between features/areas
   - Created detailed MCP tool descriptions in `docs/mcp-feature-area-tool-descriptions.md`

3. **Advanced Features**
   - Progress calculation for features and areas based on task completion
   - Automatic status determination based on contained tasks
   - Support for renaming features and areas (including moving tasks)
   - Hierarchical representation of tasks within features

## Benefits

- Better organization of related tasks using MDTM directory structure
- Enhanced support for overview files with proper handling and display
- Improved workflows for moving tasks between features or areas
- Ability to track progress and status at the feature/area level
- Better compatibility with MDTM specification

## Implementation Notes

The implementation follows existing architecture patterns with a clear separation of concerns:
- Core functionality in `src/core/`
- MCP handlers in `src/mcp/`

All methods maintain a consistent interface pattern, following the existing CRUD operations model used by tasks and phases. Feature and area functions are designed to be used seamlessly with the existing task system.

## Documentation

- Created comprehensive MCP tool descriptions in `docs/mcp-feature-area-tool-descriptions.md`
- Updated debug_code_path handler to include new feature capabilities

## Testing

Testing can be performed by:
1. Using MCP tools to create features and areas
2. Adding tasks to features/areas
3. Moving tasks between features
4. Testing that progress calculation works correctly 
5. Verifying that feature/area status is correctly determined

## Next Steps

Future work could include:
- More advanced UI representation of feature hierarchies 
- Support for nesting features within areas
- Additional filtering and sorting options for feature/area listings
- Enhanced bulk operations for tasks within features