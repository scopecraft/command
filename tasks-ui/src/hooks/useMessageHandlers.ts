import { useRef, useState } from 'react';
import type { Message, MessageBlock } from '../lib/claude-message-handler';
import { createMessageHandlers } from '../lib/claude-message-handler';

/**
 * Hook for managing Claude chat messages
 */
export function useMessageHandlers() {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentBubbleRef = useRef<{ id: string; element: HTMLDivElement } | null>(null);

  // Message handler functions
  const addMessage = (type: Message['type'], content: Message['content']) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const ensureBubble = (id: string, _role: string) => {
    if (!currentBubbleRef.current || currentBubbleRef.current.id !== id) {
      const message: Message = {
        id,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
    }
  };

  const appendText = (id: string, text?: string) => {
    if (!text) return;
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: msg.content + text } : msg))
    );
  };

  const renderToolCall = (_messageId: string, block: MessageBlock) => {
    const toolMessage: Message = {
      id: `tool-${block.id}`,
      type: 'tool_call',
      content: block,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, toolMessage]);
  };

  const renderToolResult = (toolUseId: string, result: MessageBlock) => {
    const resultMessage: Message = {
      id: `result-${toolUseId}`,
      type: 'tool_result',
      content: result,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, resultMessage]);
  };

  const closeBubble = (_id: string) => {
    currentBubbleRef.current = null;
  };

  // Create the message handlers
  const messageHandlers = createMessageHandlers({
    addMessage,
    ensureBubble,
    appendText,
    renderToolCall,
    renderToolResult,
    closeBubble,
  });

  return {
    messages,
    messageHandlers,
    addMessage,
  };
}