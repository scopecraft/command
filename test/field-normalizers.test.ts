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
      expect(normalizePriority(null)).toBe('Medium');
      expect(normalizePriority(undefined)).toBe('Medium');
      expect(normalizePriority('')).toBe('Medium');
    });

    it('should accept standard values exactly as they are', () => {
      expect(normalizePriority('Highest')).toBe('Highest');
      expect(normalizePriority('High')).toBe('High');
      expect(normalizePriority('Medium')).toBe('Medium');
      expect(normalizePriority('Low')).toBe('Low');
    });

    it('should handle emoji-only input', () => {
      expect(normalizePriority('🔥')).toBe('Highest');
      expect(normalizePriority('🔼')).toBe('High');
      expect(normalizePriority('▶️')).toBe('Medium');
      expect(normalizePriority('🔽')).toBe('Low');
    });

    it('should handle text-only input (case-insensitive)', () => {
      expect(normalizePriority('highest')).toBe('Highest');
      expect(normalizePriority('High')).toBe('High');
      expect(normalizePriority('MEDIUM')).toBe('Medium');
      expect(normalizePriority('low')).toBe('Low');
    });

    it('should handle common synonyms', () => {
      expect(normalizePriority('critical')).toBe('Highest');
      expect(normalizePriority('urgent')).toBe('Highest');
      expect(normalizePriority('important')).toBe('High');
      expect(normalizePriority('normal')).toBe('Medium');
      expect(normalizePriority('minor')).toBe('Low');
      expect(normalizePriority('trivial')).toBe('Low');
    });

    it('should handle partial matches in text', () => {
      expect(normalizePriority('This is a highest priority task')).toBe('Highest');
      expect(normalizePriority('Set to high importance')).toBe('High');
      expect(normalizePriority('Just medium for now')).toBe('Medium');
      expect(normalizePriority('This is low priority')).toBe('Low');
    });
  });

  describe('normalizeTaskStatus', () => {
    it('should return default value for null or undefined input', () => {
      expect(normalizeTaskStatus(null)).toBe('To Do');
      expect(normalizeTaskStatus(undefined)).toBe('To Do');
      expect(normalizeTaskStatus('')).toBe('To Do');
    });

    it('should accept standard values exactly as they are', () => {
      expect(normalizeTaskStatus('To Do')).toBe('To Do');
      expect(normalizeTaskStatus('In Progress')).toBe('In Progress');
      expect(normalizeTaskStatus('Done')).toBe('Done');
      expect(normalizeTaskStatus('Blocked')).toBe('Blocked');
      expect(normalizeTaskStatus('Archived')).toBe('Archived');
    });

    it('should handle emoji-only input', () => {
      expect(normalizeTaskStatus('🟡')).toBe('To Do');
      expect(normalizeTaskStatus('🔵')).toBe('In Progress');
      expect(normalizeTaskStatus('🟢')).toBe('Done');
      expect(normalizeTaskStatus('🔴')).toBe('Blocked');
      expect(normalizeTaskStatus('⚪')).toBe('Archived');
    });

    it('should handle text-only input (case-insensitive)', () => {
      expect(normalizeTaskStatus('to do')).toBe('To Do');
      expect(normalizeTaskStatus('In Progress')).toBe('In Progress');
      expect(normalizeTaskStatus('DONE')).toBe('Done');
      expect(normalizeTaskStatus('blocked')).toBe('Blocked');
      expect(normalizeTaskStatus('archived')).toBe('Archived');
    });

    it('should handle common variations', () => {
      expect(normalizeTaskStatus('todo')).toBe('To Do');
      expect(normalizeTaskStatus('pending')).toBe('To Do');
      expect(normalizeTaskStatus('wip')).toBe('In Progress');
      expect(normalizeTaskStatus('started')).toBe('In Progress');
      expect(normalizeTaskStatus('completed')).toBe('Done');
      expect(normalizeTaskStatus('finished')).toBe('Done');
      expect(normalizeTaskStatus('on hold')).toBe('Blocked');
      expect(normalizeTaskStatus('waiting')).toBe('Blocked');
      expect(normalizeTaskStatus('archive')).toBe('Archived');
    });

    it('should handle text with hyphenation or spacing variations', () => {
      expect(normalizeTaskStatus('to-do')).toBe('To Do');
      expect(normalizeTaskStatus('in-progress')).toBe('In Progress');
      expect(normalizeTaskStatus('on-hold')).toBe('Blocked');
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
