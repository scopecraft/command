import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useClaudeWebSocket } from '../hooks/useClaudeWebSocket'
import { useMessageHandlers } from '../hooks/useMessageHandlers'
import { usePromptSender } from '../hooks/usePromptSender'
import { ConnectionStatus } from '../components/claude/ConnectionStatus'
import { MessageStream } from '../components/claude/MessageStream'
import { PromptForm } from '../components/claude/PromptForm'

export const Route = createFileRoute('/assistant')({
  component: AssistantPage,
})

/**
 * Claude Assistant page component
 */
function AssistantPage() {
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use hooks
  const { messages, messageHandlers, addMessage } = useMessageHandlers()
  const { isConnected, isConnecting, error, handleConnect, handleDisconnect, sendPrompt } =
    useClaudeWebSocket({ messageHandlers })
  const { prompt, setPrompt, contextId, setContextId, updateContextId, handleSend } =
    usePromptSender({ addMessage, isConnected, handleConnect, sendPrompt })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Claude Assistant</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered assistance for your task management
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Connection Status */}
        <div className="p-4 border-b border-border">
          <ConnectionStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            error={error}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageStream messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Form */}
        <div className="p-4 border-t border-border">
          <PromptForm
            prompt={prompt}
            setPrompt={setPrompt}
            contextId={contextId}
            setContextId={setContextId}
            onSubmit={handleSubmit}
            isConnected={isConnected}
            isConnecting={isConnecting}
          />
        </div>
      </div>
    </div>
  )
}