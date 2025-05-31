import { type ReactNode, useEffect } from 'react';
import { useUIContext } from '../../context/UIContext';
import { ContentArea } from './ContentArea';
import { ErrorBoundary } from './ErrorBoundary';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from './Toast';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { ui, toggleSidebar } = useUIContext();

  // Close sidebar on small screens by default
  useEffect(() => {
    // Check if the screen is small (under 768px)
    const handleResize = () => {
      if (window.innerWidth < 768 && ui.sidebarOpen) {
        toggleSidebar();
      }
    };

    // Run once on mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive sidebar with overlay for small screens */}
        {ui.sidebarOpen && (
          <>
            {/* Overlay for small screens */}
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={toggleSidebar}
              aria-hidden="true"
            />
            {/* Sidebar with z-index to appear above overlay */}
            <div className="fixed md:relative z-50 md:z-auto h-full">
              <Sidebar />
            </div>
          </>
        )}
        <ErrorBoundary>
          <ContentArea>{children}</ContentArea>
        </ErrorBoundary>
      </div>
      <ToastContainer />
    </div>
  );
}
