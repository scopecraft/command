/**
 * Tests for field normalization utilities
 */

import { describe, expect, it } from '@jest/globals';
import {
  getPriorityOrder,
  isCompletedTaskStatus,
  normalizePriority,
  normalizeTaskStatus,
} from '../src/core/field-normalizers.js';

describe('Field Normalizers', () => {
  describe('normalizePriority', () => {
    it('should return default value for null or undefined input', () => {
      expect(normalizePriority(null)).toBe('medium');
      expect(normalizePriority(undefined)).toBe('medium');
      expect(normalizePriority('')).toBe('medium');
    });

    it('should normalize labels to canonical names', () => {
      expect(normalizePriority('Highest')).toBe('highest');
      expect(normalizePriority('High')).toBe('high');
      expect(normalizePriority('Medium')).toBe('medium');
      expect(normalizePriority('Low')).toBe('low');
    });

    it('should handle emoji-only input', () => {
      expect(normalizePriority('🔥')).toBe('highest');
      expect(normalizePriority('🔼')).toBe('high');
      expect(normalizePriority('▶️')).toBe('medium');
      expect(normalizePriority('🔽')).toBe('low');
    });

    it('should handle canonical names (case-insensitive)', () => {
      expect(normalizePriority('highest')).toBe('highest');
      expect(normalizePriority('HIGH')).toBe('high');
      expect(normalizePriority('MEDIUM')).toBe('medium');
      expect(normalizePriority('low')).toBe('low');
    });

    it('should handle common synonyms using aliases', () => {
      expect(normalizePriority('critical')).toBe('highest');
      expect(normalizePriority('urgent')).toBe('highest');
      expect(normalizePriority('important')).toBe('high');
      expect(normalizePriority('normal')).toBe('medium');
      expect(normalizePriority('minor')).toBe('low');
      expect(normalizePriority('trivial')).toBe('low');
    });

    it('should handle partial matches in text', () => {
      expect(normalizePriority('highest')).toBe('highest');
      expect(normalizePriority('high')).toBe('high');
      expect(normalizePriority('medium')).toBe('medium');
      expect(normalizePriority('low')).toBe('low');
    });
  });

  describe('normalizeTaskStatus', () => {
    it('should return default value for null or undefined input', () => {
      expect(normalizeTaskStatus(null)).toBe('todo');
      expect(normalizeTaskStatus(undefined)).toBe('todo');
      expect(normalizeTaskStatus('')).toBe('todo');
    });

    it('should normalize labels to canonical names', () => {
      expect(normalizeTaskStatus('To Do')).toBe('todo');
      expect(normalizeTaskStatus('In Progress')).toBe('in_progress');
      expect(normalizeTaskStatus('Done')).toBe('done');
      expect(normalizeTaskStatus('Blocked')).toBe('blocked');
      expect(normalizeTaskStatus('Archived')).toBe('archived');
    });

    it('should handle emoji-only input', () => {
      expect(normalizeTaskStatus('🟡')).toBe('todo');
      expect(normalizeTaskStatus('🔵')).toBe('in_progress');
      expect(normalizeTaskStatus('🟢')).toBe('done');
      expect(normalizeTaskStatus('🔴')).toBe('blocked');
      expect(normalizeTaskStatus('⚪')).toBe('archived');
    });

    it('should handle canonical names (case-insensitive)', () => {
      expect(normalizeTaskStatus('todo')).toBe('todo');
      expect(normalizeTaskStatus('in_progress')).toBe('in_progress');
      expect(normalizeTaskStatus('DONE')).toBe('done');
      expect(normalizeTaskStatus('blocked')).toBe('blocked');
      expect(normalizeTaskStatus('archived')).toBe('archived');
    });

    it('should handle common variations using aliases', () => {
      expect(normalizeTaskStatus('new')).toBe('todo');
      expect(normalizeTaskStatus('pending')).toBe('todo');
      expect(normalizeTaskStatus('wip')).toBe('in_progress');
      expect(normalizeTaskStatus('started')).toBe('in_progress');
      expect(normalizeTaskStatus('completed')).toBe('done');
      expect(normalizeTaskStatus('finished')).toBe('done');
      expect(normalizeTaskStatus('on-hold')).toBe('blocked');
      expect(normalizeTaskStatus('waiting')).toBe('blocked');
      expect(normalizeTaskStatus('archive')).toBe('archived');
    });

    it('should handle text with hyphenation or spacing variations', () => {
      expect(normalizeTaskStatus('in-progress')).toBe('in_progress');
      expect(normalizeTaskStatus('in_progress')).toBe('in_progress');
      expect(normalizeTaskStatus('on-hold')).toBe('blocked');
    });
  });

  describe('isCompletedTaskStatus', () => {
    it('should return false for null or undefined input', () => {
      expect(isCompletedTaskStatus(null)).toBe(false);
      expect(isCompletedTaskStatus(undefined)).toBe(false);
      expect(isCompletedTaskStatus('')).toBe(false);
    });

    it('should return true for done status with emoji', () => {
      expect(isCompletedTaskStatus('🟢 Done')).toBe(true);
    });

    it('should return true for done status without emoji', () => {
      expect(isCompletedTaskStatus('Done')).toBe(true);
    });

    it('should return true for completed status variations', () => {
      expect(isCompletedTaskStatus('Completed')).toBe(true);
      expect(isCompletedTaskStatus('COMPLETE')).toBe(true);
      expect(isCompletedTaskStatus('Task is completed')).toBe(true);
    });

    it('should return false for non-completed statuses', () => {
      expect(isCompletedTaskStatus('🟡 To Do')).toBe(false);
      expect(isCompletedTaskStatus('🔵 In Progress')).toBe(false);
      expect(isCompletedTaskStatus('⚪ Blocked')).toBe(false);
      expect(isCompletedTaskStatus('To Do')).toBe(false);
    });
  });

  describe('getPriorityOrder', () => {
    it('should return 0 for null or undefined input', () => {
      expect(getPriorityOrder(null)).toBe(0);
      expect(getPriorityOrder(undefined)).toBe(0);
      expect(getPriorityOrder('')).toBe(0);
    });

    it('should return correct priority order for standard values', () => {
      expect(getPriorityOrder('🔥 Highest')).toBe(4);
      expect(getPriorityOrder('🔼 High')).toBe(3);
      expect(getPriorityOrder('▶️ Medium')).toBe(2);
      expect(getPriorityOrder('🔽 Low')).toBe(1);
    });

    it('should normalize input before determining order', () => {
      expect(getPriorityOrder('highest')).toBe(4);
      expect(getPriorityOrder('high')).toBe(3);
      expect(getPriorityOrder('medium')).toBe(2);
      expect(getPriorityOrder('low')).toBe(1);

      expect(getPriorityOrder('critical')).toBe(4);
      expect(getPriorityOrder('important')).toBe(3);
      expect(getPriorityOrder('normal')).toBe(2);
      expect(getPriorityOrder('minor')).toBe(1);
    });
  });
});
