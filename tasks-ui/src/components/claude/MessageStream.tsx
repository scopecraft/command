import type { RefObject } from 'react';
import type { Message } from '../../lib/claude-message-handler';
import { MessageDisplay } from '../task-detail/MessageDisplay';

interface MessageStreamProps {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement>;
}

/**
 * Message stream display component
 */
export function MessageStream({ messages, messagesEndRef }: MessageStreamProps) {
  return (
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
  );
}
