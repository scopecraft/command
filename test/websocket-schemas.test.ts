import { describe, it, expect } from 'bun:test';
import { ClaudeWebSocketMessageSchema } from '../tasks-ui/websocket/schemas';

describe('WebSocket Schemas', () => {
  describe('ClaudeWebSocketMessageSchema', () => {
    it('should validate correct message', () => {
      const valid = {
        prompt: 'Hello Claude',
        meta: 'TASK-123'
      };
      
      const result = ClaudeWebSocketMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(valid);
      }
    });
    
    it('should reject empty prompt', () => {
      const invalid = {
        prompt: '',
        meta: 'TASK-123'
      };
      
      const result = ClaudeWebSocketMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
    
    it('should reject prompt over 8192 chars', () => {
      const invalid = {
        prompt: 'a'.repeat(8193),
        meta: 'TASK-123'
      };
      
      const result = ClaudeWebSocketMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
    
    it('should reject invalid meta format', () => {
      const invalid = {
        prompt: 'Hello',
        meta: 'invalid-meta!'
      };
      
      const result = ClaudeWebSocketMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid meta format');
      }
    });
    
    it('should accept valid meta formats', () => {
      const validMetas = ['TASK-123', 'FEATURE_456', 'BUG_789', 'TEST-ABC-123'];
      
      for (const meta of validMetas) {
        const message = { prompt: 'Hello', meta };
        const result = ClaudeWebSocketMessageSchema.safeParse(message);
        expect(result.success).toBe(true);
      }
    });
  });
});