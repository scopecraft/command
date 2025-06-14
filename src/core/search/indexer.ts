/**
 * Search Indexer
 * Handles content indexing for search service
 */

import * as core from '../index.js';
import type { Task, TaskDocument, WorkflowState } from '../types.js';
import type {
  ContentChange,
  OperationResult,
  SearchAdapter,
  SearchDocument,
  SearchIndex,
} from './types.js';

/**
 * Indexer for processing and indexing content
 */
export class SearchIndexer {
  constructor(private adapter: SearchAdapter) {}

  /**
   * Index entire project
   */
  async indexProject(projectRoot: string, index: SearchIndex): Promise<OperationResult<void>> {
    try {
      // Use existing core functions to scan tasks
      const listOptions = {
        includeArchived: true,
        includeParentTasks: true,
        workflowStates: ['backlog', 'current', 'archive'] as WorkflowState[],
      };

      const taskResult = await core.list(projectRoot, listOptions);
      if (!taskResult.success) {
        return { success: false, error: taskResult.error || 'Failed to list tasks' };
      }

      // Process each task into SearchDocument
      const documents: SearchDocument[] = [];
      for (const task of taskResult.data || []) {
        const doc = this.processTaskToDocument(task);
        if (doc) documents.push(doc);
      }

      // Index documents using adapter
      await this.adapter.bulkIndex(index, documents);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown indexing error',
      };
    }
  }

  /**
   * Update index with content changes
   */
  async updateIndex(
    index: SearchIndex,
    changes: ContentChange[],
    projectRoot: string
  ): Promise<OperationResult<void>> {
    try {
      for (const change of changes) {
        switch (change.type) {
          case 'add':
          case 'update':
            // Load the task to get full content
            const taskResult = await core.get(projectRoot, change.id);
            if (taskResult.success && taskResult.data) {
              const doc = this.processTaskToDocument(taskResult.data);
              if (doc) {
                if (change.type === 'update') {
                  // Remove old version first
                  await this.adapter.removeDocument(index, change.id);
                }
                await this.adapter.addDocument(index, doc);
              }
            }
            break;

          case 'delete':
            await this.adapter.removeDocument(index, change.id);
            break;
        }
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      };
    }
  }

  /**
   * Process task to search document
   */
  private processTaskToDocument(task: Task): SearchDocument | null {
    try {
      const content = this.extractSearchableContent(task.document);

      return {
        id: task.metadata.id,
        title: task.document.title,
        content,
        type: task.metadata.isParentTask ? 'parent' : 'task',
        path: task.metadata.path,
        status: task.document.frontmatter.status,
        area: task.document.frontmatter.area,
        tags: task.document.frontmatter.tags || [],
        workflowState: task.metadata.location.workflowState,
        priority: task.document.frontmatter.priority,
        assignee: task.document.frontmatter.assignee as string | undefined,
        isParentTask: task.metadata.isParentTask,
        parentTask: task.metadata.parentTask,
        createdAt: task.metadata.createdAt || new Date().toISOString(),
        updatedAt: task.metadata.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.warn(`Failed to process task ${task.metadata.id}:`, error);
      return null;
    }
  }

  /**
   * Extract searchable content from task document
   */
  private extractSearchableContent(document: TaskDocument): string {
    // Use existing parseTaskDocument sections
    const sections = [
      document.title,
      document.sections?.instruction || '',
      document.sections?.tasks || '',
      document.sections?.deliverable || '',
      // Include log section for historical context
      document.sections?.log || '',
    ];

    // Add tags to searchable content (joined as space-separated string)
    if (document.tags && document.tags.length > 0) {
      sections.push(document.tags.join(' '));
    }

    return sections
      .join(' ')
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
      .replace(/^[-*+]\s/gm, '') // Remove list markers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
