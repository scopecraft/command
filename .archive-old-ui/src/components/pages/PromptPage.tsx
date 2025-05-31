import { useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
import { useClaudeWebSocket } from '../../hooks/useClaudeWebSocket';
import { useMessageHandlers } from '../../hooks/useMessageHandlers';
import { usePromptSender } from '../../hooks/usePromptSender';
import { ConnectionStatus } from '../claude/ConnectionStatus';
import { MessageStream } from '../claude/MessageStream';
import { PromptForm } from '../claude/PromptForm';

/**
 * PromptPage component for Claude assistant interface
 */
export function PromptPage() {
  // Check if we're on the route with ID
  const [matchesWithId, paramsWithId] = useRoute('/prompt/:id');
  const id = matchesWithId ? paramsWithId?.id : undefined;

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use hooks
  const { messages, messageHandlers, addMessage } = useMessageHandlers();
  const { isConnected, isConnecting, error, handleConnect, handleDisconnect, sendPrompt } =
    useClaudeWebSocket({ messageHandlers });
  const { prompt, setPrompt, contextId, setContextId, updateContextId, handleSend } =
    usePromptSender({ addMessage, isConnected, handleConnect, sendPrompt });

  // Update context when route ID changes
  useEffect(() => {
    updateContextId(id);
  }, [id, updateContextId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-xl font-semibold mb-4">Claude Assistant</h1>

      {/* Prompt Form */}
      <PromptForm
        prompt={prompt}
        setPrompt={setPrompt}
        contextId={contextId}
        setContextId={setContextId}
        isConnecting={isConnecting}
        isConnected={isConnected}
        id={id}
        handleSubmit={handleSubmit}
        handleDisconnect={handleDisconnect}
      />

      {/* Connection Status */}
      <ConnectionStatus isConnected={isConnected} isConnecting={isConnecting} error={error} />

      {/* Message Stream */}
      <MessageStream messages={messages} messagesEndRef={messagesEndRef} />
    </div>
  );
}
