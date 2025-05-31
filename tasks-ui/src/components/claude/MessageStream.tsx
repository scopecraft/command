import type { Message } from '../../lib/claude-message-handler';
import { MessageDisplay } from '../task-detail/MessageDisplay';

interface MessageStreamProps {
  messages: Message[];
}

/**
 * Message stream display component
 */
export function MessageStream({ messages }: MessageStreamProps) {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          No messages yet. Send a prompt to start the conversation.
        </div>
      ) : (
        messages.map((message) => (
          <MessageDisplay key={message.id} message={message} />
        ))
      )}
    </div>
  );
}
