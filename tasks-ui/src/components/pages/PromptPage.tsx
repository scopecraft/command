import { useState, useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';

interface Message {
  id: string;
  type: 'assistant' | 'tool_call' | 'tool_result' | 'error' | 'info' | 'user';
  content: any;
  timestamp: Date;
}

export function PromptPage() {
  // Check if we're on the route with ID
  const [matchesWithId, paramsWithId] = useRoute('/prompt/:id');
  const id = matchesWithId ? paramsWithId?.id : undefined;
  
  // State
  const [prompt, setPrompt] = useState('');
  const [contextId, setContextId] = useState(id || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentBubbleRef = useRef<{ id: string; element: HTMLDivElement } | null>(null);
  
  // Update context when route ID changes
  useEffect(() => {
    if (id) {
      setContextId(id);
    }
  }, [id]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
      handleMessage(event.data);
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
        setError(`Connection closed with code ${event.code}${event.reason ? `: ${event.reason}` : ''}`);
      }
    };
  };
  
  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };
  
  const handleSend = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    if (!isConnected) {
      handleConnect();
      // Wait for connection then send
      const checkConnection = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearInterval(checkConnection);
          sendPrompt();
        }
      }, 100);
    } else {
      sendPrompt();
    }
  };
  
  const sendPrompt = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected');
      return;
    }
    
    // Get the current value from the state
    const currentPrompt = prompt;
    const currentContext = contextId;
    
    // Add user message to display what was actually sent
    addMessage('user', `${currentPrompt}${currentContext ? ` [Context: ${currentContext}]` : ''}`);
    
    const message = {
      prompt: currentPrompt,
      meta: currentContext || undefined
    };
    
    console.log('[Client] Sending message:', message);
    wsRef.current.send(JSON.stringify(message));
    setPrompt(''); // Clear prompt after sending
  };
  
  const handleMessage = (data: string) => {
    console.log('[Client] Received message:', data);
    
    try {
      const msg = JSON.parse(data);
      
      if (msg.error) {
        addMessage('error', msg.error);
        return;
      }
      
      if (msg.info) {
        addMessage('info', msg.info);
        return;
      }
      
      if (msg.type === 'user_echo') {
        addMessage('info', msg.content);
        return;
      }
      
      if (msg.type === 'message') {
        ensureBubble(msg.id, msg.role);
        for (const block of msg.content || []) {
          if (block.type === 'text') {
            appendText(msg.id, block.text);
          } else if (block.type === 'tool_use') {
            renderToolCall(msg.id, block);
          }
        }
        if (msg.stop_reason === 'end_turn') {
          closeBubble(msg.id);
        }
        return;
      }
      
      // Handle tool results from user role
      if (msg.role === 'user' && msg.content) {
        const toolResults = msg.content.filter((b: any) => b.type === 'tool_result');
        for (const result of toolResults) {
          renderToolResult(result.tool_use_id, result);
        }
      }
      
    } catch (e) {
      // If not JSON, treat as plain text assistant message
      addMessage('assistant', data);
    }
  };
  
  const addMessage = (type: Message['type'], content: any) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };
  
  const ensureBubble = (id: string, role: string) => {
    if (!currentBubbleRef.current || currentBubbleRef.current.id !== id) {
      const message: Message = {
        id,
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
    }
  };
  
  const appendText = (id: string, text: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content: msg.content + text } : msg
    ));
  };
  
  const renderToolCall = (messageId: string, block: any) => {
    const toolMessage: Message = {
      id: `tool-${block.id}`,
      type: 'tool_call',
      content: block,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, toolMessage]);
  };
  
  const renderToolResult = (toolUseId: string, result: any) => {
    const resultMessage: Message = {
      id: `result-${toolUseId}`,
      type: 'tool_result',
      content: result,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, resultMessage]);
  };
  
  const closeBubble = (id: string) => {
    currentBubbleRef.current = null;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-xl font-semibold mb-4">Claude Assistant</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            Prompt
          </label>
          <textarea
            id="prompt"
            className="min-h-32 w-full rounded-md bg-input px-3 py-2 text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="What can I help you with? (Ctrl+Enter to send)"
            disabled={isConnecting}
          />
        </div>
        
        {/* Context and Actions */}
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label htmlFor="context" className="text-sm font-medium">
              Context (Optional) {id && <span className="text-muted-foreground">*Pre-filled from URL</span>}
            </label>
            <input
              id="context"
              className="w-full rounded-md bg-input px-3 py-2 text-sm"
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              placeholder="TASK-123"
              disabled={isConnecting}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit"
              disabled={isConnecting || !prompt.trim()}
            >
              {isConnecting ? 'Connecting...' : 'Send'}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleDisconnect}
              disabled={!isConnected || isConnecting}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </form>
        
        {/* Status */}
        <div className="text-sm">
          Status: {' '}
          <span className={`inline-flex items-center ${
            isConnected ? 'text-green-600' : 
            isConnecting ? 'text-blue-600' : 
            'text-gray-500'
          }`}>
            <span className="mr-1">
              {isConnected ? '●' : isConnecting ? '◉' : '○'}
            </span>
            {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
          </span>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        
      {/* Response Stream */}
      <div className="border border-border rounded-md bg-card p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No messages yet. Send a prompt to start.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageDisplay key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

// Message display component
function MessageDisplay({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false);
  
  if (message.type === 'info') {
    return (
      <div className="text-muted-foreground text-sm italic">
        {message.content}
      </div>
    );
  }
  
  if (message.type === 'error') {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start gap-2">
        <span>❌</span>
        <span>{message.content}</span>
      </div>
    );
  }
  
  if (message.type === 'user') {
    return (
      <div className="bg-blue-500/10 rounded-md p-3">
        <div className="font-medium mb-1">User</div>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  }
  
  if (message.type === 'assistant') {
    return (
      <div className="bg-secondary/20 rounded-md p-3">
        <div className="font-medium mb-1">Assistant</div>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  }
  
  if (message.type === 'tool_call') {
    return (
      <div className="bg-muted/50 rounded-md p-3">
        <div className="flex items-start gap-2">
          <span>📡</span>
          <div className="flex-1">
            <div className="font-medium">Tool Call: {message.content.name}</div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {expanded ? '▼ Hide details' : '▶ Show details'}
            </button>
            {expanded && (
              <pre className="mt-2 text-xs bg-background rounded p-2 overflow-x-auto">
                {JSON.stringify(message.content.input, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (message.type === 'tool_result') {
    return (
      <div className="bg-green-500/10 rounded-md p-3">
        <div className="flex items-start gap-2">
          <span>🛠️</span>
          <div className="flex-1">
            <div className="font-medium">Tool Result</div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {expanded ? '▼ Hide details' : '▶ Show details'}
            </button>
            {expanded && (
              <pre className="mt-2 text-xs bg-background rounded p-2 overflow-x-auto">
                {JSON.stringify(message.content.content, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}