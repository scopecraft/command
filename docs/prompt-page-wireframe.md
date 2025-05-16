# Claude Prompt Page UX Design

## Route Structure
- `/prompt` - Generic prompt page
- `/prompt/:id` - Prompt page with pre-filled meta ID (e.g., TASK-123, FEATURE-456, AREA-789)

## Design Philosophy
- Follow the existing terminal-inspired design aesthetic (Atlas color scheme)
- Use consistent UI components and styling patterns from the task-ui
- Create a self-contained component that's easy to replace
- Focus on clear visual feedback for streaming responses
- Support deep linking from tasks, features, and areas

## Wireframe Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Prompt                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Prompt Input                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  [Multiline textarea for user prompt]                 │  │
│  │  What can I help you with?                            │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Context (Optional)              [Send] [Disconnect]        │
│  ┌─────────────────────┐         ──────   ──────────       │
│  │ TASK-123           │         *Pre-filled from URL      │
│  └─────────────────────┘                                    │
│                                                             │
│  Status: ● Connected / ○ Disconnected / ◉ Connecting        │
│                                                             │
│  Response Stream                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  Assistant                                            │  │
│  │  ──────────                                          │  │
│  │  Hello! I can help you with TASK-123...               │  │
│  │                                                       │  │
│  │  📡 Tool Call: Read                                   │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ File: /path/to/file.ts                     │    │  │
│  │  │ [▼ Show details]                           │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  🛠️ Tool Result                                       │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ Content: File contents...                  │    │  │
│  │  │ [▼ Show details]                           │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  ❌ Error                                             │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ Connection timeout                         │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Selection

1. **Layout**: 
   - Use container structure similar to existing pages
   - Responsive design with max-width constraints

2. **Input Components**:
   - Textarea with styling from TaskFormView
   - Input field for context/meta (pre-filled when ID present)
   - Button components for Send/Disconnect actions

3. **Status Display**:
   - Simple text with colored indicators:
     - ● Green for connected
     - ○ Gray for disconnected
     - ◉ Blue for connecting

4. **Response Stream**:
   - Card-like container with scrollable area
   - Message sections with distinct styling:
     - Assistant text (light background)
     - Tool calls (📡 icon with collapsible details)
     - Tool results (🛠️ icon with collapsible details)
     - Errors (❌ icon with red background)

## Interaction Patterns

1. **URL Parameter Handling**:
   - Extract ID from URL params
   - Pre-fill context field with ID
   - Allow user to modify if needed

2. **Connection Management**:
   - Auto-connect when sending first message
   - Clear disconnect button
   - Visual connection status

3. **Streaming Display**:
   - Messages appear in real-time as they stream
   - Auto-scroll to bottom for new content
   - Preserve scroll position if user scrolls up
   - Loading indicators during streaming

4. **Error Handling**:
   - Inline error messages in the stream
   - Connection errors at the top
   - Form validation before sending

## Integration Points

The prompt page can be linked from:

1. **Task Detail Page**:
   ```tsx
   <Button onClick={() => navigate(`/prompt/${task.id}`)}>
     Open Claude Assistant
   </Button>
   ```

2. **Feature Detail Page**:
   ```tsx
   <Button onClick={() => navigate(`/prompt/${feature.id}`)}>
     Open Claude Assistant
   </Button>
   ```

3. **Area Detail Page**:
   ```tsx
   <Button onClick={() => navigate(`/prompt/${area.id}`)}>
     Open Claude Assistant
   </Button>
   ```

## Styling Approach

- Use existing Atlas color variables from the theme
- Leverage input/textarea classes from existing forms
- Consistent spacing using Tailwind utilities
- Dark theme support via CSS variables
- Responsive design for mobile/tablet/desktop

## State Management

```typescript
interface PromptPageState {
  prompt: string;
  contextId: string;  // From URL or manual input
  isConnected: boolean;
  isConnecting: boolean;
  messages: Message[];
  error: string | null;
}

interface Message {
  id: string;
  type: 'assistant' | 'tool_call' | 'tool_result' | 'error';
  content: any;
  timestamp: Date;
}
```

## Future Enhancements

1. **Message History**: Save conversation history per ID
2. **Templates**: Quick prompt templates based on entity type
3. **Export**: Save conversation as markdown
4. **Multiple Contexts**: Support multiple IDs in one session