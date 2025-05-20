import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Toast, UIState } from '../lib/types';

interface UIContextType {
  ui: UIState;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setActiveView: (view: 'home' | 'list' | 'detail' | 'form' | 'create' | 'graph') => void;
  setActiveTaskId: (taskId: string | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleSectionCollapsed: (section: keyof UIState['collapsedSections']) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const DEFAULT_UI_STATE: UIState = {
  sidebarOpen: true,
  darkMode: true,
  activeView: 'home',
  activeTaskId: null,
  toasts: [],
  collapsedSections: {
    views: false,
    phases: false,
    features: false,
    areas: false,
  },
};

const LOCAL_STORAGE_KEY = 'tasks-ui-preferences';

export function UIProvider({ children }: { children: ReactNode }) {
  const [ui, setUI] = useState<UIState>(() => {
    // Load UI state from localStorage if available
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          ...DEFAULT_UI_STATE,
          ...parsed,
          // Always start with an empty toasts array
          toasts: [],
        };
      }
    } catch (e) {
      console.error('Failed to parse saved UI state:', e);
    }
    return DEFAULT_UI_STATE;
  });

  // Save UI preferences to localStorage whenever they change
  useEffect(() => {
    const uiPrefs = {
      sidebarOpen: ui.sidebarOpen,
      darkMode: ui.darkMode,
      collapsedSections: ui.collapsedSections,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(uiPrefs));

    // Apply dark mode class to document
    if (ui.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [ui.sidebarOpen, ui.darkMode, ui.collapsedSections]);

  const toggleSidebar = () => {
    setUI((prev) => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen,
    }));
  };

  const toggleDarkMode = () => {
    setUI((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  const setActiveView = (view: 'home' | 'list' | 'detail' | 'form' | 'create' | 'graph') => {
    setUI((prev) => ({
      ...prev,
      activeView: view,
    }));
  };

  const setActiveTaskId = (taskId: string | null) => {
    setUI((prev) => ({
      ...prev,
      activeTaskId: taskId,
      // If a task is selected, switch to detail view
      ...(taskId ? { activeView: 'detail' } : {}),
    }));
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setUI((prev) => ({
      ...prev,
      toasts: [...prev.toasts, newToast],
    }));

    // Auto-remove toast after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setUI((prev) => ({
      ...prev,
      toasts: prev.toasts.filter((toast) => toast.id !== id),
    }));
  };

  const toggleSectionCollapsed = (section: keyof UIState['collapsedSections']) => {
    setUI((prev) => ({
      ...prev,
      collapsedSections: {
        ...prev.collapsedSections,
        [section]: !prev.collapsedSections[section],
      },
    }));
  };

  const value = {
    ui,
    toggleSidebar,
    toggleDarkMode,
    setActiveView,
    setActiveTaskId,
    addToast,
    removeToast,
    toggleSectionCollapsed,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
}
