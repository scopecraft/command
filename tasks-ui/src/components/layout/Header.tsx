import { useLocation } from 'wouter';
import { useUIContext } from '../../context/UIContext';
import { routes } from '../../lib/routes';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export function Header() {
  const { ui, toggleSidebar, toggleDarkMode } = useUIContext();
  const [, navigate] = useLocation();

  const handleHomeLinkClick = () => {
    console.log('Home clicked, navigating to home route');
    navigate(routes.home);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={ui.sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        {/* Atlas-inspired logo with icon and text treatment */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleHomeLinkClick}
          role="button"
          tabIndex={0}
        >
          <div className="w-8 h-8 bg-[var(--atlas-navy)] rounded flex items-center justify-center text-[var(--cream)] font-bold">
            T
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground uppercase leading-tight">Command</h1>
            <div className="text-[10px] text-muted-foreground uppercase">TASK MANAGER</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-label={ui.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {ui.darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-menu', className)}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-sun', className)}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-moon', className)}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
