import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SectionEditor } from './SectionEditor';

const meta = {
  title: 'V2/SectionEditor/Demo',
  component: SectionEditor,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'atlas-dark',
      values: [
        { name: 'atlas-dark', value: '#121212' },
        { name: 'terminal-dark', value: '#1A1A1A' },
      ],
    },
  },
} satisfies Meta<typeof SectionEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive demo showing all sections
export const TaskEditingDemo = () => {
  const [instruction, setInstruction] =
    useState(`Implement the SectionEditor component in Storybook based on the design specifications. This is a STORYBOOK-ONLY implementation.

### Requirements
1. **Extract DualUseMarkdown pattern** from reference/document-editor/
2. **Remove AI actions** - keep only core edit functionality
3. **Hover-to-edit** with keyboard shortcuts (E to edit)
4. **Atlas theme styling** per design guide`);

  const [tasks, setTasks] = useState(`- [x] Study DualUseMarkdown in document-editor
- [x] Create SectionEditor.tsx component
- [x] Implement view/edit mode toggle
- [x] Add hover state detection
- [x] Implement keyboard shortcuts (E, Shift+Enter, Escape)
- [x] Apply Atlas theme styling
- [x] Create SectionEditor.stories.tsx
- [ ] Add all 6 required story variations
- [ ] Test keyboard interactions
- [ ] Add component documentation`);

  const [deliverable, setDeliverable] = useState('');
  const [log, setLog] = useState(`- 2025-01-05 10:15: Started component implementation
- 2025-01-05 10:45: Extracted DualUseMarkdown pattern
- 2025-01-05 11:20: Completed basic component structure
- 2025-01-05 14:00: Added keyboard shortcuts and hover states`);

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-mono uppercase text-[var(--cream)]">Task Editor Demo</h1>
      <p className="text-[var(--cream)]/60 font-mono text-sm">
        Try hovering over sections and pressing 'E' to edit. Use Shift+Enter to save or Escape to
        cancel.
      </p>

      <div className="space-y-4">
        <SectionEditor
          section="instruction"
          content={instruction}
          onSave={async (content) => {
            console.log('Saving instruction:', content);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setInstruction(content);
          }}
        />

        <SectionEditor
          section="tasks"
          content={tasks}
          onSave={async (content) => {
            console.log('Saving tasks:', content);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setTasks(content);
          }}
        />

        <SectionEditor
          section="deliverable"
          content={deliverable}
          onSave={async (content) => {
            console.log('Saving deliverable:', content);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setDeliverable(content);
          }}
        />

        <SectionEditor
          section="log"
          content={log}
          onSave={async (content) => {
            console.log('Saving log:', content);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setLog(content);
          }}
        />
      </div>

      <div className="mt-8 p-4 rounded-lg bg-[var(--terminal-dark)] border border-white/10">
        <h2 className="text-sm font-mono uppercase text-[var(--cream)]/60 mb-2">
          Current State (JSON)
        </h2>
        <pre className="text-xs font-mono text-[var(--atlas-light)] overflow-auto">
          {JSON.stringify({ instruction, tasks, deliverable, log }, null, 2)}
        </pre>
      </div>
    </div>
  );
};
