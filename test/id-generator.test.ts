/**
 * Tests for ID generator
 */

import { describe, expect, it, jest } from '@jest/globals';
import {
  DEFAULT_STOP_WORDS,
  TASK_TYPE_MAPPING,
  extractContext,
  generateRandomSuffix,
  generateTaskId,
  getTypePrefix,
  validateTaskId,
} from '../src/core/task-manager/id-generator.js';

describe('ID Generator', () => {
  describe('getTypePrefix', () => {
    it('should return correct prefix for known task types', () => {
      expect(getTypePrefix('🚀 Implementation')).toBe('FEAT');
      expect(getTypePrefix('🐛 Bug')).toBe('BUG');
      expect(getTypePrefix('📚 Documentation')).toBe('DOC');
      expect(getTypePrefix('🧪 Test')).toBe('TEST');
    });

    it('should handle partial matches', () => {
      expect(getTypePrefix('Bug Fix')).toBe('BUG');
      expect(getTypePrefix('Feature Implementation')).toBe('FEAT');
      expect(getTypePrefix('Documentation Update')).toBe('DOC');
    });

    it('should return TASK for unknown types', () => {
      expect(getTypePrefix('Unknown Type')).toBe('TASK');
      expect(getTypePrefix('')).toBe('TASK');
      expect(getTypePrefix(null as any)).toBe('TASK');
    });
  });

  describe('extractContext', () => {
    it('should extract meaningful words from title', () => {
      expect(extractContext('Implement user authentication')).toBe('IMPLEMENTUSER');
      expect(extractContext('Fix login bug')).toBe('FIXLOGIN');
      expect(extractContext('Update database schema')).toBe('UPDATEDATABASE');
    });

    it('should handle empty or invalid titles', () => {
      expect(extractContext('')).toBe('');
      expect(extractContext('the and')).toBe(''); // Only stop words
      expect(extractContext(null as any)).toBe('');
    });

    it('should remove special characters', () => {
      expect(extractContext('Fix user-auth bug!')).toBe('FIXUSERAUTH');
      expect(extractContext('Update @mentions feature')).toBe('UPDATEMENTIONS');
    });

    it('should respect max words limit', () => {
      expect(extractContext('Implement user authentication system', DEFAULT_STOP_WORDS, 1)).toBe(
        'IMPLEMENT'
      );
      expect(extractContext('Implement user authentication system', DEFAULT_STOP_WORDS, 3)).toBe(
        'IMPLEMENTUSERAUTHENTICATION'
      );
    });

    it('should use custom stop words', () => {
      const customStopWords = new Set(['implement', 'fix']);
      expect(extractContext('Implement authentication', customStopWords)).toBe('AUTHENTICATION');
      expect(extractContext('Fix bug', customStopWords)).toBe('BUG');
    });
  });

  describe('generateRandomSuffix', () => {
    it('should generate a 2-character string', () => {
      const suffix = generateRandomSuffix();
      expect(suffix).toHaveLength(2);
    });

    it('should only use allowed characters', () => {
      const allowedChars = /^[0-9A-HJ-NP-Z]+$/;
      for (let i = 0; i < 100; i++) {
        const suffix = generateRandomSuffix();
        expect(suffix).toMatch(allowedChars);
      }
    });

    it('should generate different values', () => {
      const suffixes = new Set();
      for (let i = 0; i < 50; i++) {
        suffixes.add(generateRandomSuffix());
      }
      // Should have generated at least 40 unique values out of 50
      expect(suffixes.size).toBeGreaterThan(40);
    });
  });

  describe('generateTaskId', () => {
    const mockDate = new Date('2025-05-18');

    it('should generate ID with all components', () => {
      const id = generateTaskId({
        type: '🚀 Implementation',
        title: 'Fix user authentication',
        today: mockDate,
      });

      // Should match format: FEAT-FIXUSER-0518-XX
      expect(id).toMatch(/^FEAT-FIXUSER-0518-[A-Z0-9]{2}$/);
    });

    it('should handle missing title', () => {
      const id = generateTaskId({
        type: '🐛 Bug',
        title: '',
        today: mockDate,
      });

      // Should match format: BUG-0518-XX (no context)
      expect(id).toMatch(/^BUG-0518-[A-Z0-9]{2}$/);
    });

    it('should handle missing type', () => {
      const id = generateTaskId({
        type: '',
        title: 'Fix login issue',
        today: mockDate,
      });

      // Should match format: TASK-FIXLOGIN-0518-XX
      expect(id).toMatch(/^TASK-FIXLOGIN-0518-[A-Z0-9]{2}$/);
    });

    it('should handle both missing', () => {
      const id = generateTaskId({
        type: '',
        title: '',
        today: mockDate,
      });

      // Should match format: TASK-0518-XX
      expect(id).toMatch(/^TASK-0518-[A-Z0-9]{2}$/);
    });

    it('should format dates correctly', () => {
      // Test different months and days
      const dates = [
        { date: new Date('2025-01-01'), expected: '0101' },
        { date: new Date('2025-12-31'), expected: '1231' },
        { date: new Date('2025-09-09'), expected: '0909' },
        { date: new Date('2025-10-10'), expected: '1010' },
      ];

      for (const { date, expected } of dates) {
        const id = generateTaskId({
          type: 'TASK',
          title: 'Test',
          today: date,
        });
        expect(id).toContain(`-${expected}-`);
      }
    });

    it('should use custom context length', () => {
      const id = generateTaskId({
        type: '🚀 Implementation',
        title: 'Implement user authentication system',
        maxContextLength: 3,
        today: mockDate,
      });

      // Should have more context words
      expect(id).toMatch(/^FEAT-IMPLEMENTUSERAUTHENTICATION-0518-[A-Z0-9]{2}$/);
    });
  });

  describe('validateTaskId', () => {
    it('should validate new format IDs', () => {
      expect(validateTaskId('FEAT-USERAUTH-0518-K3')).toBe(true);
      expect(validateTaskId('BUG-LOGIN-1231-9Z')).toBe(true);
      expect(validateTaskId('TASK-0101-AA')).toBe(true); // No context
    });

    it('should validate old timestamp format for backwards compatibility', () => {
      expect(validateTaskId('TASK-20250518T203045')).toBe(true);
      expect(validateTaskId('TASK-20240101T000000')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateTaskId('')).toBe(false);
      expect(validateTaskId('INVALID')).toBe(false);
      expect(validateTaskId('FEAT-CONTEXT-DATE-X')).toBe(false); // Wrong date format
      expect(validateTaskId('feat-context-0518-xx')).toBe(false); // Lowercase
      expect(validateTaskId('FEAT-CONTEXT-0518-X')).toBe(false); // Single char suffix
      expect(validateTaskId('FEAT-CONTEXT-0518-XXX')).toBe(false); // Three char suffix
    });
  });
});
