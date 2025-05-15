/**
 * Tests for field normalization utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  normalizePriority,
  normalizeTaskStatus,
  normalizePhaseStatus,
  isCompletedTaskStatus,
  getPriorityOrder,
  PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  PHASE_STATUS_VALUES
} from '../src/core/field-normalizers.js';

describe('Field Normalizers', () => {
  describe('normalizePriority', () => {
    it('should return default value for null or undefined input', () => {
      expect(normalizePriority(null)).toBe(PRIORITY_VALUES.DEFAULT);
      expect(normalizePriority(undefined)).toBe(PRIORITY_VALUES.DEFAULT);
      expect(normalizePriority('')).toBe(PRIORITY_VALUES.DEFAULT);
    });

    it('should accept standard values exactly as they are', () => {
      expect(normalizePriority('🔥 Highest')).toBe(PRIORITY_VALUES.HIGHEST);
      expect(normalizePriority('🔼 High')).toBe(PRIORITY_VALUES.HIGH);
      expect(normalizePriority('▶️ Medium')).toBe(PRIORITY_VALUES.MEDIUM);
      expect(normalizePriority('🔽 Low')).toBe(PRIORITY_VALUES.LOW);
    });

    it('should handle emoji-only input', () => {
      expect(normalizePriority('🔥')).toBe(PRIORITY_VALUES.HIGHEST);
      expect(normalizePriority('🔼')).toBe(PRIORITY_VALUES.HIGH);
      expect(normalizePriority('▶️')).toBe(PRIORITY_VALUES.MEDIUM);
      expect(normalizePriority('🔽')).toBe(PRIORITY_VALUES.LOW);
    });

    it('should handle text-only input (case-insensitive)', () => {
      expect(normalizePriority('highest')).toBe(PRIORITY_VALUES.HIGHEST);
      expect(normalizePriority('High')).toBe(PRIORITY_VALUES.HIGH);
      expect(normalizePriority('MEDIUM')).toBe(PRIORITY_VALUES.MEDIUM);
      expect(normalizePriority('low')).toBe(PRIORITY_VALUES.LOW);
    });

    it('should handle common synonyms', () => {
      expect(normalizePriority('critical')).toBe(PRIORITY_VALUES.HIGHEST);
      expect(normalizePriority('urgent')).toBe(PRIORITY_VALUES.HIGHEST);
      expect(normalizePriority('important')).toBe(PRIORITY_VALUES.HIGH);
      expect(normalizePriority('normal')).toBe(PRIORITY_VALUES.MEDIUM);
      expect(normalizePriority('minor')).toBe(PRIORITY_VALUES.LOW);
      expect(normalizePriority('trivial')).toBe(PRIORITY_VALUES.LOW);
    });

    it('should handle partial matches in text', () => {
      expect(normalizePriority('This is a highest priority task')).toBe(PRIORITY_VALUES.HIGHEST);
      expect(normalizePriority('Set to high importance')).toBe(PRIORITY_VALUES.HIGH);
      expect(normalizePriority('Just medium for now')).toBe(PRIORITY_VALUES.MEDIUM);
      expect(normalizePriority('This is low priority')).toBe(PRIORITY_VALUES.LOW);
    });
  });

  describe('normalizeTaskStatus', () => {
    it('should return default value for null or undefined input', () => {
      expect(normalizeTaskStatus(null)).toBe(TASK_STATUS_VALUES.DEFAULT);
      expect(normalizeTaskStatus(undefined)).toBe(TASK_STATUS_VALUES.DEFAULT);
      expect(normalizeTaskStatus('')).toBe(TASK_STATUS_VALUES.DEFAULT);
    });

    it('should accept standard values exactly as they are', () => {
      expect(normalizeTaskStatus('🟡 To Do')).toBe(TASK_STATUS_VALUES.TODO);
      expect(normalizeTaskStatus('🔵 In Progress')).toBe(TASK_STATUS_VALUES.IN_PROGRESS);
      expect(normalizeTaskStatus('🟢 Done')).toBe(TASK_STATUS_VALUES.DONE);
      expect(normalizeTaskStatus('⚪ Blocked')).toBe(TASK_STATUS_VALUES.BLOCKED);
      expect(normalizeTaskStatus('🟣 Review')).toBe(TASK_STATUS_VALUES.REVIEW);
    });

    it('should handle emoji-only input', () => {
      expect(normalizeTaskStatus('🟡')).toBe(TASK_STATUS_VALUES.TODO);
      expect(normalizeTaskStatus('🔵')).toBe(TASK_STATUS_VALUES.IN_PROGRESS);
      expect(normalizeTaskStatus('🟢')).toBe(TASK_STATUS_VALUES.DONE);
      expect(normalizeTaskStatus('⚪')).toBe(TASK_STATUS_VALUES.BLOCKED);
      expect(normalizeTaskStatus('🟣')).toBe(TASK_STATUS_VALUES.REVIEW);
    });

    it('should handle text-only input (case-insensitive)', () => {
      expect(normalizeTaskStatus('to do')).toBe(TASK_STATUS_VALUES.TODO);
      expect(normalizeTaskStatus('In Progress')).toBe(TASK_STATUS_VALUES.IN_PROGRESS);
      expect(normalizeTaskStatus('DONE')).toBe(TASK_STATUS_VALUES.DONE);
      expect(normalizeTaskStatus('blocked')).toBe(TASK_STATUS_VALUES.BLOCKED);
      expect(normalizeTaskStatus('review')).toBe(TASK_STATUS_VALUES.REVIEW);
    });

    it('should handle common variations', () => {
      expect(normalizeTaskStatus('todo')).toBe(TASK_STATUS_VALUES.TODO);
      expect(normalizeTaskStatus('pending')).toBe(TASK_STATUS_VALUES.TODO);
      expect(normalizeTaskStatus('wip')).toBe(TASK_STATUS_VALUES.IN_PROGRESS);
      expect(normalizeTaskStatus('started')).toBe(TASK_STATUS_VALUES.IN_PROGRESS);
      expect(normalizeTaskStatus('completed')).toBe(TASK_STATUS_VALUES.DONE);
      expect(normalizeTaskStatus('finished')).toBe(TASK_STATUS_VALUES.DONE);
      expect(normalizeTaskStatus('on hold')).toBe(TASK_STATUS_VALUES.BLOCKED);
      expect(normalizeTaskStatus('waiting')).toBe(TASK_STATUS_VALUES.BLOCKED);
      expect(normalizeTaskStatus('in review')).toBe(TASK_STATUS_VALUES.REVIEW);
      expect(normalizeTaskStatus('validating')).toBe(TASK_STATUS_VALUES.REVIEW);
    });

    it('should handle text with hyphenation or spacing variations', () => {
      expect(normalizeTaskStatus('to-do')).toBe(TASK_STATUS_VALUES.TODO);
      expect(normalizeTaskStatus('in-progress')).toBe(TASK_STATUS_VALUES.IN_PROGRESS);
      expect(normalizeTaskStatus('on-hold')).toBe(TASK_STATUS_VALUES.BLOCKED);
      expect(normalizeTaskStatus('in-review')).toBe(TASK_STATUS_VALUES.REVIEW);
    });
  });

  describe('normalizePhaseStatus', () => {
    it('should return default value for null or undefined input', () => {
      expect(normalizePhaseStatus(null)).toBe(PHASE_STATUS_VALUES.DEFAULT);
      expect(normalizePhaseStatus(undefined)).toBe(PHASE_STATUS_VALUES.DEFAULT);
      expect(normalizePhaseStatus('')).toBe(PHASE_STATUS_VALUES.DEFAULT);
    });

    it('should accept standard values exactly as they are', () => {
      expect(normalizePhaseStatus('🟡 Pending')).toBe(PHASE_STATUS_VALUES.PENDING);
      expect(normalizePhaseStatus('🔵 In Progress')).toBe(PHASE_STATUS_VALUES.IN_PROGRESS);
      expect(normalizePhaseStatus('🟢 Completed')).toBe(PHASE_STATUS_VALUES.COMPLETED);
      expect(normalizePhaseStatus('⚪ Blocked')).toBe(PHASE_STATUS_VALUES.BLOCKED);
      expect(normalizePhaseStatus('🗄️ Archived')).toBe(PHASE_STATUS_VALUES.ARCHIVED);
    });

    it('should handle emoji-only input', () => {
      expect(normalizePhaseStatus('🟡')).toBe(PHASE_STATUS_VALUES.PENDING);
      expect(normalizePhaseStatus('🔵')).toBe(PHASE_STATUS_VALUES.IN_PROGRESS);
      expect(normalizePhaseStatus('🟢')).toBe(PHASE_STATUS_VALUES.COMPLETED);
      expect(normalizePhaseStatus('⚪')).toBe(PHASE_STATUS_VALUES.BLOCKED);
      expect(normalizePhaseStatus('🗄️')).toBe(PHASE_STATUS_VALUES.ARCHIVED);
    });

    it('should handle text-only input (case-insensitive)', () => {
      expect(normalizePhaseStatus('pending')).toBe(PHASE_STATUS_VALUES.PENDING);
      expect(normalizePhaseStatus('In Progress')).toBe(PHASE_STATUS_VALUES.IN_PROGRESS);
      expect(normalizePhaseStatus('COMPLETED')).toBe(PHASE_STATUS_VALUES.COMPLETED);
      expect(normalizePhaseStatus('blocked')).toBe(PHASE_STATUS_VALUES.BLOCKED);
      expect(normalizePhaseStatus('archived')).toBe(PHASE_STATUS_VALUES.ARCHIVED);
    });

    it('should handle common variations', () => {
      expect(normalizePhaseStatus('planned')).toBe(PHASE_STATUS_VALUES.PENDING);
      expect(normalizePhaseStatus('to do')).toBe(PHASE_STATUS_VALUES.PENDING);
      expect(normalizePhaseStatus('backlog')).toBe(PHASE_STATUS_VALUES.PENDING);
      expect(normalizePhaseStatus('active')).toBe(PHASE_STATUS_VALUES.IN_PROGRESS);
      expect(normalizePhaseStatus('current')).toBe(PHASE_STATUS_VALUES.IN_PROGRESS);
      expect(normalizePhaseStatus('done')).toBe(PHASE_STATUS_VALUES.COMPLETED);
      expect(normalizePhaseStatus('finish')).toBe(PHASE_STATUS_VALUES.COMPLETED);
      expect(normalizePhaseStatus('on hold')).toBe(PHASE_STATUS_VALUES.BLOCKED);
      expect(normalizePhaseStatus('waiting')).toBe(PHASE_STATUS_VALUES.BLOCKED);
      expect(normalizePhaseStatus('inactive')).toBe(PHASE_STATUS_VALUES.ARCHIVED);
      expect(normalizePhaseStatus('retired')).toBe(PHASE_STATUS_VALUES.ARCHIVED);
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
      expect(isCompletedTaskStatus('🟣 Review')).toBe(false);
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