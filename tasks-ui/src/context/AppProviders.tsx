import type { ReactNode } from 'react';
import { AreaProvider } from './AreaContext';
import { FeatureProvider } from './FeatureContext';
import { PhaseProvider } from './PhaseContext';
import { TaskProvider } from './TaskContext';
import { UIProvider } from './UIContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UIProvider>
      <PhaseProvider>
        <FeatureProvider>
          <AreaProvider>
            <TaskProvider>{children}</TaskProvider>
          </AreaProvider>
        </FeatureProvider>
      </PhaseProvider>
    </UIProvider>
  );
}
