import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ContentArea } from './ContentArea';
import { useUIContext } from '../../context/UIContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { ui } = useUIContext();
  
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {ui.sidebarOpen && <Sidebar />}
        <ContentArea>{children}</ContentArea>
      </div>
    </div>
  );
}