/**
 * Tests for MCP phase support functionality
 * Verifies that phase parameter is handled correctly in MCP handlers
 */

import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync, rmSync, readFileSync } from 'fs';
import { buildTaskCreateOptionsBase } from '../../../src/mcp/handlers/shared/options-builders.js';

describe('MCP Phase Support', () => {
  describe('buildTaskCreateOptionsBase with phase', () => {
    test('includes phase in task create options', () => {
      const params = {
        title: 'Test Task',
        type: 'feature',
        area: 'test',
        phase: 'active',
        instruction: 'Test instruction'
      };

      const result = buildTaskCreateOptionsBase(params);

      expect(result.title).toBe('Test Task');
      expect(result.type).toBe('feature');
      expect(result.area).toBe('test');
      expect(result.phase).toBe('active');
      expect(result.instruction).toBe('Test instruction');
    });

    test('handles missing phase parameter', () => {
      const params = {
        title: 'Test Task',
        type: 'bug',
        area: 'test'
      };

      const result = buildTaskCreateOptionsBase(params);

      expect(result.title).toBe('Test Task');
      expect(result.type).toBe('bug');
      expect(result.area).toBe('test');
      expect(result.phase).toBeUndefined();
    });

    test('passes through all phase values correctly', () => {
      const phases = ['planning', 'active', 'completed'];
      
      phases.forEach(phase => {
        const params = {
          title: 'Test Task',
          type: 'test',
          phase
        };

        const result = buildTaskCreateOptionsBase(params);
        expect(result.phase).toBe(phase);
      });
    });
  });

  // Note: buildListFilters is not exported from read-handlers, 
  // so we test the integration through the actual MCP handlers in higher-level tests
});