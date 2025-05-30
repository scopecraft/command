import { Outlet, createRootRoute, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { Sidebar } from '../components/v2/Sidebar'
import { Button } from '../components/ui/button'
import { Menu, Moon, Sun } from 'lucide-react'
import { cn } from '../lib/utils'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const navigate = useNavigate()

  // Toggle dark mode class on document
  if (darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate({ to: '/' })}
              role="button"
              tabIndex={0}
            >
              <div className="w-8 h-8 bg-[var(--atlas-navy)] rounded flex items-center justify-center text-[var(--cream)] font-bold">
                S
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground uppercase leading-tight">Scopecraft</h1>
                <div className="text-[10px] text-muted-foreground uppercase">TASK MANAGER V2</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Responsive sidebar with overlay for small screens */}
          {sidebarOpen && (
            <>
              {/* Overlay for small screens */}
              <div
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              {/* Sidebar */}
              <div className={cn(
                "fixed md:relative z-50 md:z-auto h-full w-64 border-r border-border bg-background",
                "md:block"
              )}>
                <Sidebar />
              </div>
            </>
          )}
          
          {/* Main content */}
          <main className="flex-1 overflow-auto p-4 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Dev tools */}
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools position="bottom-left" />
    </QueryClientProvider>
  )
}