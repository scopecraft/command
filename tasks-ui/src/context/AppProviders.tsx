import type { ReactNode } from 'react';
import { TaskProvider } from './TaskContext';
import { PhaseProvider } from './PhaseContext';
import { UIProvider } from './UIContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UIProvider>
      <PhaseProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </PhaseProvider>
    </UIProvider>
  );
}