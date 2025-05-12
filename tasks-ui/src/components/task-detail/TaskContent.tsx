import type { Task } from '../../lib/types';

interface TaskContentProps {
  task: Task;
}

export function TaskContent({ task }: TaskContentProps) {
  // Format content for display
  // We'll use a simple formatting approach for now
  // Later this will be enhanced with a proper markdown renderer
  const formattedContent = task.content?.split('\n').map((line, i) => {
    // Handle headers
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-lg font-bold mt-3 mb-2">{line.substring(3)}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-md font-bold mt-2 mb-1">{line.substring(4)}</h3>;
    }
    
    // Handle lists
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4">{line.substring(2)}</li>;
    }
    
    // Handle blank lines
    if (line.trim() === '') {
      return <br key={i} />;
    }
    
    // Default case - regular paragraph
    return <p key={i} className="my-1">{line}</p>;
  });

  // If there's no content, show a placeholder
  if (!task.content || task.content.trim() === '') {
    return (
      <div className="bg-card p-4 rounded-md border border-border min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No content available for this task.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-md border border-border">
      <h2 className="text-lg font-semibold mb-4">Description</h2>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {formattedContent}
      </div>
    </div>
  );
}