/**
 * Task section configuration
 * Defines the available sections and their properties
 */

// Centralized section configuration
export const TASK_SECTIONS = {
  instruction: { title: "Instruction", order: 1 },
  tasks: { title: "Tasks", order: 2 },
  deliverable: { title: "Deliverable", order: 3 },
  log: { title: "Log", order: 4 }
} as const;

export type TaskSectionKey = keyof typeof TASK_SECTIONS;
export type TaskSections = Record<TaskSectionKey, string>;

// Helper functions for working with sections
export const getSectionKeys = (): TaskSectionKey[] => Object.keys(TASK_SECTIONS) as TaskSectionKey[];
export const getSectionTitle = (key: TaskSectionKey): string => TASK_SECTIONS[key].title;
export const getSectionOrder = (key: TaskSectionKey): number => TASK_SECTIONS[key].order;
export const getSectionsByOrder = (): TaskSectionKey[] => 
  getSectionKeys().sort((a, b) => getSectionOrder(a) - getSectionOrder(b));