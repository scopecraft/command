import { useState } from 'react';
import type { Message } from '../../lib/claude-message-handler';

// Helper function to prettify and format JSON
function formatJSON(content: unknown): string {
  try {
    // If it's already a string, try to parse it
    if (typeof content === 'string') {
      try {
        // Try to parse if it looks like JSON
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, 2);
        }
        // Not JSON, return as is
        return content;
      } catch {
        // If parse fails, it's not JSON, return as is
        return content;
      }
    }

    // If it's an object, stringify it with formatting
    return JSON.stringify(content, null, 2);
  } catch (_error) {
    // If anything fails, return as string or "[Object]" if conversion fails
    return String(content) || '[Object]';
  }
}

// Component for collapsible content
function CollapsibleContent({
  title,
  content,
  icon = '📋',
  bgColorClass = 'bg-muted/50',
}: {
  title: string;
  content: unknown;
  icon?: string;
  bgColorClass?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const formattedContent = formatJSON(content);

  // Check if content is likely JSON (begins with { or [)
  const isJsonContent =
    typeof formattedContent === 'string' &&
    (formattedContent.trim().startsWith('{') || formattedContent.trim().startsWith('['));

  return (
    <div className={`${bgColorClass} rounded-md p-3`}>
      <div className="flex items-start gap-2">
        <span>{icon}</span>
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {expanded ? '▼ Hide details' : '▶ Show details'}
          </button>
          {expanded && (
            <pre className="mt-2 text-xs bg-background rounded p-2 overflow-x-auto">
              {isJsonContent ? formattedContent : String(content)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// Message display component for Claude chat messages
export function MessageDisplay({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false);

  // Helper to detect if content is complex/JSON and should use collapsible
  const isComplexContent = (content: unknown): boolean => {
    if (typeof content === 'object' && content !== null) {
      return true;
    }

    if (typeof content === 'string') {
      // Check if it looks like JSON
      return content.trim().startsWith('{') || content.trim().startsWith('[');
    }

    return false;
  };

  // Helper to extract text if available
  const extractText = (content: unknown): string | null => {
    if (typeof content === 'string') {
      return content;
    }

    if (typeof content === 'object' && content !== null) {
      // Handle MessageBlock with text
      if ((content as any).text) {
        return (content as any).text;
      }

      // Handle array of message blocks
      if (Array.isArray(content)) {
        const textBlocks = content
          .filter((item) => typeof item === 'object' && item.type === 'text' && item.text)
          .map((item) => item.text);

        if (textBlocks.length > 0) {
          return textBlocks.join('\n');
        }
      }
    }

    return null;
  };

  // Info messages
  if (message.type === 'info') {
    return <div className="text-muted-foreground text-sm italic">{message.content}</div>;
  }

  // Error messages
  if (message.type === 'error') {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start gap-2">
        <span>❌</span>
        <span>{message.content}</span>
      </div>
    );
  }

  // User messages
  if (message.type === 'user') {
    const content = message.content;

    // For complex content, use collapsible
    if (isComplexContent(content)) {
      return (
        <CollapsibleContent
          title="User Message"
          content={content}
          icon="👤"
          bgColorClass="bg-blue-500/10"
        />
      );
    }

    // For simple content, display directly
    return (
      <div className="bg-blue-500/10 rounded-md p-3">
        <div className="font-medium mb-1">User</div>
        <div className="text-sm whitespace-pre-wrap">{String(content)}</div>
      </div>
    );
  }

  // Assistant messages
  if (message.type === 'assistant') {
    const content = message.content;

    // First, try to extract text content using our helper
    const extractedText = extractText(content);

    // If we got simple text, display it directly
    if (extractedText) {
      return (
        <div className="bg-secondary/20 rounded-md p-3">
          <div className="font-medium mb-1">Assistant</div>
          <div className="text-sm whitespace-pre-wrap">{extractedText}</div>
        </div>
      );
    }

    // If content is complex, build a collapsible component but always show some text
    return (
      <div className="bg-secondary/20 rounded-md p-3">
        <div className="flex items-start gap-2">
          <span>🤖</span>
          <div className="flex-1">
            <div className="font-medium">Assistant</div>

            {/* Extract and display text content */}
            {typeof content === 'object' && (
              <div className="text-sm whitespace-pre-wrap mb-2">
                {(() => {
                  // Try different paths to find text content
                  if (typeof content === 'string') {
                    return content;
                  }

                  // Handle array content with text blocks
                  if (Array.isArray(content)) {
                    const textParts = content
                      .filter((item) => item && typeof item === 'object' && item.type === 'text')
                      .map((item) => item.text)
                      .filter(Boolean);

                    if (textParts.length > 0) {
                      return textParts.join('\n');
                    }
                  }

                  // Try to get text from nested content structure
                  if (content && typeof content === 'object') {
                    // Check for common text patterns
                    if ((content as any).text) {
                      return (content as any).text;
                    }

                    // Check for assistant message inside content
                    if ((content as any).message?.content) {
                      const msgContent = (content as any).message.content;
                      if (Array.isArray(msgContent)) {
                        return msgContent
                          .filter((item) => item && item.type === 'text')
                          .map((item) => item.text)
                          .join('\n');
                      }
                    }

                    // Check for content with result property (like final message)
                    if ((content as any).result && typeof (content as any).result === 'string') {
                      return (content as any).result;
                    }
                  }

                  return 'Message content details available below';
                })()}
              </div>
            )}

            {/* Collapsible JSON details */}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {expanded ? '▼ Hide details' : '▶ Show details'}
            </button>

            {expanded && (
              <pre className="mt-2 text-xs bg-background rounded p-2 overflow-x-auto">
                {formatJSON(content)}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tool call messages
  if (message.type === 'tool_call') {
    const toolName = message.content.name || 'Unknown Tool';
    const toolInput = message.content.input || {};

    // Create a better display for tool calls similar to assistant messages
    return (
      <div className="bg-muted/50 rounded-md p-3">
        <div className="flex items-start gap-2">
          <span>📡</span>
          <div className="flex-1">
            <div className="font-medium">Tool Call: {toolName}</div>

            {/* Show a summary of the tool input if possible */}
            {toolInput && typeof toolInput === 'object' && (
              <div className="text-sm mb-2">
                {(() => {
                  // Try to create a readable summary of the tool input
                  const summary = [];

                  // Add description if available
                  if ((toolInput as any).description) {
                    summary.push(`Description: ${(toolInput as any).description}`);
                  }

                  // Add prompt if available (for AI tools)
                  if ((toolInput as any).prompt) {
                    const prompt = (toolInput as any).prompt;
                    // Truncate long prompts
                    summary.push(
                      `Prompt: ${prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt}`
                    );
                  }

                  // Return summary if we have one, otherwise a generic message
                  return summary.length > 0
                    ? summary.join('\n')
                    : 'Tool input details available below';
                })()}
              </div>
            )}

            {/* Collapsible JSON details */}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {expanded ? '▼ Hide details' : '▶ Show details'}
            </button>

            {expanded && (
              <pre className="mt-2 text-xs bg-background rounded p-2 overflow-x-auto">
                {formatJSON(toolInput)}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tool result messages
  if (message.type === 'tool_result') {
    const resultContent = message.content;

    // Process tool result content - extract text and useful parts
    const extractTextContent = () => {
      if (typeof resultContent !== 'object' || resultContent === null) {
        return String(resultContent);
      }

      // Handle case where content is an array of content blocks
      if (Array.isArray(resultContent.content)) {
        // Find text blocks and extract their text
        const textBlocks = resultContent.content.filter(
          (block) => typeof block === 'object' && block.type === 'text' && block.text
        );

        if (textBlocks.length > 0) {
          // Choose the first text block or combine all text blocks
          return textBlocks.map((block) => block.text).join('\n');
        }
      }

      // Try to find JSON inside the text content - common for tool results
      if (
        resultContent.content &&
        Array.isArray(resultContent.content) &&
        resultContent.content[0] &&
        resultContent.content[0].text
      ) {
        const text = resultContent.content[0].text;

        // Try to parse as JSON for nicer display
        try {
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const parsed = JSON.parse(text);

            // If it parsed successfully and has a data property, extract useful info
            if (parsed.data) {
              if (parsed.data.content) {
                // For task content, show a snippet
                return `${parsed.data.content.substring(0, 150)}...`;
              }

              if (parsed.data.metadata) {
                // For task metadata, create a summary
                const metadata = parsed.data.metadata;
                const summary = [];

                if (metadata.title) summary.push(`Title: ${metadata.title}`);
                if (metadata.type) summary.push(`Type: ${metadata.type}`);
                if (metadata.status) summary.push(`Status: ${metadata.status}`);

                return summary.join('\n');
              }
            }

            // Return the first 150 chars or so
            return `${JSON.stringify(parsed).substring(0, 150)}...`;
          }
        } catch (_e) {
          // If JSON parsing fails, return the original text
          return `${text.substring(0, 150)}...`;
        }
      }

      // Handle direct content property with data structure
      if (resultContent.content && typeof resultContent.content === 'object') {
        // If content has a success and data property, process it as a typical tool result
        if ('success' in resultContent.content && resultContent.content.data) {
          const data = resultContent.content.data;

          if (data.metadata) {
            const metadata = data.metadata;
            const summary = [];

            if (metadata.title) summary.push(`Title: ${metadata.title}`);
            if (metadata.type) summary.push(`Type: ${metadata.type}`);
            if (metadata.status) summary.push(`Status: ${metadata.status}`);

            return summary.join('\n');
          }

          if (data.content) {
            return `Content: ${data.content.substring(0, 100)}...`;
          }

          return 'Tool successfully returned data (see details)';
        }
      }

      // For other content types, stringify with truncation
      return 'Tool returned result data (see details)';
    };

    // Function to get the full content for display
    const getFullContent = () => {
      // If there's nested text content, parse and format it
      if (
        resultContent.content &&
        Array.isArray(resultContent.content) &&
        resultContent.content[0] &&
        resultContent.content[0].text
      ) {
        const text = resultContent.content[0].text;

        // Try to parse and pretty-print JSON
        try {
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const parsed = JSON.parse(text);
            return JSON.stringify(parsed, null, 2);
          }
        } catch (_e) {
          // If parsing fails, return the original text
        }

        return text;
      }

      // Handle direct content property that contains the result
      if (typeof resultContent === 'object' && resultContent !== null) {
        // Check for common tool result patterns
        if (resultContent.content && typeof resultContent.content === 'object') {
          return formatJSON(resultContent.content);
        }
      }

      // Otherwise return the full content object
      return formatJSON(resultContent);
    };

    return (
      <div className="bg-green-500/10 rounded-md p-3">
        <div className="flex items-start gap-2">
          <span>🛠️</span>
          <div className="flex-1">
            <div className="font-medium">Tool Result</div>

            {/* Show a summary of the result if possible */}
            <div className="text-sm whitespace-pre-wrap mb-2">{extractTextContent()}</div>

            {/* Collapsible JSON details */}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {expanded ? '▼ Hide details' : '▶ Show details'}
            </button>

            {expanded && (
              <pre className="mt-2 text-xs bg-background rounded p-2 overflow-x-auto">
                {getFullContent()}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for any other message types
  return (
    <CollapsibleContent
      title={`Message (${message.type})`}
      content={message.content}
      icon="📄"
      bgColorClass="bg-muted/20"
    />
  );
}
