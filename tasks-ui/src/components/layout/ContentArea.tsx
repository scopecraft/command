import type { ReactNode } from 'react';
import { useUIContext } from '../../context/UIContext';

interface ContentAreaProps {
  children: ReactNode;
}

export function ContentArea({ children }: ContentAreaProps) {
  // Using UIContext but not using ui directly yet
  useUIContext();

  return <main className="flex-1 h-full overflow-auto p-4 bg-background">{children}</main>;
}
