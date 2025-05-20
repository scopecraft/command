import { useCallback, useState } from 'react';

interface UsePromptSenderProps {
  addMessage: (type: string, content: any) => void;
  isConnected: boolean;
  handleConnect: () => void;
  sendPrompt: (prompt: string, contextId?: string) => boolean;
}

/**
 * Hook for handling prompt sending logic
 */
export function usePromptSender({
  addMessage,
  isConnected,
  handleConnect,
  sendPrompt,
}: UsePromptSenderProps) {
  const [prompt, setPrompt] = useState('');
  const [contextId, setContextId] = useState('');

  // Update context ID from route param
  const updateContextId = useCallback((id?: string) => {
    if (id) {
      setContextId(id);
    }
  }, []);

  // Handle sending the prompt
  const handleSend = () => {
    if (!prompt.trim()) return;

    // Display user message
    addMessage('user', `${prompt}${contextId ? ` [Context: ${contextId}]` : ''}`);

    if (!isConnected) {
      handleConnect();

      // Wait for connection then send
      const checkConnection = setInterval(() => {
        if (sendPrompt(prompt, contextId)) {
          clearInterval(checkConnection);
          setPrompt('');
        }
      }, 100);
    } else {
      if (sendPrompt(prompt, contextId)) {
        setPrompt('');
      }
    }
  };

  return {
    prompt,
    setPrompt,
    contextId,
    setContextId,
    updateContextId,
    handleSend,
  };
}
