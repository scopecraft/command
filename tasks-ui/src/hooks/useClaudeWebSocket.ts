import { useRef, useState } from 'react';
import type { MessageHandlerInterface } from '../lib/claude-message-handler';

interface UseClaudeWebSocketProps {
  messageHandlers: MessageHandlerInterface;
}

export function useClaudeWebSocket({ messageHandlers }: UseClaudeWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const handleConnect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Use relative WebSocket URL - same server that serves the React app
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/claude`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      // Will receive info message automatically
    };

    ws.onmessage = (event) => {
      messageHandlers.handleMessage(event.data);
    };

    ws.onerror = (event) => {
      setError('WebSocket error occurred');
      console.error('WebSocket error:', event);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(false);
      wsRef.current = null;

      if (event.code !== 1000) {
        setError(
          `Connection closed with code ${event.code}${event.reason ? `: ${event.reason}` : ''}`
        );
      }
    };
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const sendPrompt = (prompt: string, contextId?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected');
      return false;
    }

    // Create the message to send to Claude
    const message = {
      prompt,
      meta: contextId || undefined,
    };

    console.log('[Client] Sending message:', message);
    wsRef.current.send(JSON.stringify(message));
    return true;
  };

  return {
    isConnected,
    isConnecting,
    error,
    handleConnect,
    handleDisconnect,
    sendPrompt,
  };
}