import { Button } from '../ui/button';

interface PromptFormProps {
  prompt: string;
  setPrompt: (value: string) => void;
  contextId: string;
  setContextId: (value: string) => void;
  isConnecting: boolean;
  isConnected: boolean;
  id?: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleDisconnect: () => void;
}

/**
 * Prompt input form component
 */
export function PromptForm({
  prompt,
  setPrompt,
  contextId,
  setContextId,
  isConnecting,
  isConnected,
  id,
  handleSubmit,
  handleDisconnect,
}: PromptFormProps) {
  return (
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
          <Button type="submit" disabled={isConnecting || !prompt.trim()}>
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
  );
}