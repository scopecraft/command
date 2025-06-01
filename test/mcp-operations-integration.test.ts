/**
 * Integration test for MCP operations
 * Tests the actual handlers with parameter transformation
 */

import { existsSync, rmSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import { handleParentOperationsNormalized } from '../src/mcp/normalized-write-handlers.js';
import { handleTaskCreateNormalized } from '../src/mcp/normalized-write-handlers.js';
import { handleTaskDeleteNormalized } from '../src/mcp/normalized-write-handlers.js';
import { transformMcpParams } from '../src/mcp/parameter-transformer.js';

describe('MCP Operations Integration', () => {
  const testDir = './test-mcp-integration';
  
  beforeEach(() => {
    // Use the current project directory for testing since we need existing tasks
    const configManager = ConfigurationManager.getInstance();
    configManager.setRootFromCLI(process.cwd());
  });

  describe('parent_operations resequence', () => {
    it('should handle snake_case to camelCase transformation and execute resequence', async () => {

      // Test the transformation
      const snakeCaseParams = {
        parent_id: 'implement-v2-structure',
        operation: 'resequence',
        sequence_map: [
          { id: '11_finl-int-tes-and-val-bef-merg-05F', sequence: '10' },
          { id: '10_refc-mcp-han-to-use-cle-obj-05O', sequence: '11' }
        ]
      };

      // Transform parameters
      const transformedParams = transformMcpParams(snakeCaseParams);
      
      // Verify transformation worked
      expect(transformedParams).toHaveProperty('parentId');
      expect(transformedParams).toHaveProperty('operationData');
      expect((transformedParams as any).operationData.operation).toBe('resequence');
      expect((transformedParams as any).operationData.sequenceMap).toHaveLength(2);

      // Execute the operation
      const result = await handleParentOperationsNormalized(transformedParams);
      
      expect(result.success).toBe(true);
      expect(result.data?.affectedSubtasks).toHaveLength(2);
      
      // Revert the changes
      const revertParams = {
        parent_id: 'implement-v2-structure',
        operation: 'resequence',
        sequence_map: [
          { id: '10_finl-int-tes-and-val-bef-merg-05F', sequence: '10' },
          { id: '11_refc-mcp-han-to-use-cle-obj-05O', sequence: '11' }
        ]
      };

      const revertResult = await handleParentOperationsNormalized(
        transformMcpParams(revertParams)
      );
      
      expect(revertResult.success).toBe(true);
    });
  });

  describe('task_create with parent_id', () => {
    it('should create a subtask when parent_id is provided', async () => {

      // Test creating a subtask
      const snakeCaseParams = {
        title: 'Test MCP subtask creation',
        type: 'test',
        parent_id: 'implement-v2-structure'
      };

      // Transform parameters
      const transformedParams = transformMcpParams(snakeCaseParams);
      
      // Verify transformation
      expect(transformedParams).toHaveProperty('parentId');
      expect((transformedParams as any).parentId).toBe('implement-v2-structure');

      // Execute the operation
      const result = await handleTaskCreateNormalized(transformedParams);
      
      if (!result.success) {
        console.log('Task creation failed:', result.error);
      }
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Subtask');
      expect(result.data?.id).toBeTruthy();
      
      const createdTaskId = result.data?.id;
      console.log('Created subtask ID:', createdTaskId);
      console.log('Created subtask path:', result.data?.path);

      // Verify the task was created as a subtask
      expect(result.data?.path).toContain('implement-v2-structure');

      // Clean up - delete the test task
      if (createdTaskId) {
        const deleteParams = {
          id: createdTaskId,
          parent_id: 'implement-v2-structure'
        };
        
        const deleteResult = await handleTaskDeleteNormalized(
          transformMcpParams(deleteParams)
        );
        
        if (!deleteResult.success) {
          console.log('Delete failed:', deleteResult.error);
        }
        
        expect(deleteResult.success).toBe(true);
      }
    });

    it('should create a regular task when parent_id is not provided', async () => {

      // Test creating a regular task
      const snakeCaseParams = {
        title: 'Test MCP regular task creation',
        type: 'test'
      };

      // Transform parameters
      const transformedParams = transformMcpParams(snakeCaseParams);
      
      // Verify no parentId
      expect(transformedParams).not.toHaveProperty('parentId');

      // Execute the operation
      const result = await handleTaskCreateNormalized(transformedParams);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Task');
      expect(result.message).not.toContain('Subtask');
      expect(result.data?.id).toBeTruthy();
      
      const createdTaskId = result.data?.id;

      // Verify the task was created as a regular task
      expect(result.data?.path).not.toContain('implement-v2-structure');

      // Clean up - delete the test task
      if (createdTaskId) {
        const deleteParams = {
          id: createdTaskId
        };
        
        const deleteResult = await handleTaskDeleteNormalized(
          transformMcpParams(deleteParams)
        );
        
        expect(deleteResult.success).toBe(true);
      }
    });
  });
});