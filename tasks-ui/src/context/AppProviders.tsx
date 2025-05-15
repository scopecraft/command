import type { ReactNode } from 'react';
import { TaskProvider } from './TaskContext';
import { PhaseProvider } from './PhaseContext';
import { UIProvider } from './UIContext';
import { FeatureProvider } from './FeatureContext';
import { AreaProvider } from './AreaContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UIProvider>
      <PhaseProvider>
        <FeatureProvider>
          <AreaProvider>
            <TaskProvider>
              {children}
            </TaskProvider>
          </AreaProvider>
        </FeatureProvider>
      </PhaseProvider>
    </UIProvider>
  );
}