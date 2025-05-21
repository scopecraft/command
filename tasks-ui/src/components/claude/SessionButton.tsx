import React, { useState, useEffect } from 'react';
import { useUIContext } from '../../context/UIContext';
import {
  SessionInputSchema,
  checkSessionExists,
  startClaudeSession,
} from '../../lib/api/claude-sessions';
import { Button } from '../ui/button';
import './SessionButton.css';

interface ClaudeSessionButtonProps {
  taskId: string;
  type: 'task' | 'feature';
}

export function ClaudeSessionButton({ taskId, type }: ClaudeSessionButtonProps) {
  const [sessionExists, setSessionExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedMode, setSelectedMode] = useState('none');
  const { addToast } = useUIContext();

  // Simple mode options that should work in any environment
  const modeOptions = [
    { value: 'none', label: 'Basic Claude' },
    { value: 'implement', label: 'Implementation Mode' },
  ];

  // Check session status on mount and periodically
  useEffect(() => {
    let isMounted = true;

    // Simple function to check session status
    async function checkCurrentStatus() {
      if (!isMounted) return;

      try {
        const result = await checkSessionExists(taskId, type);

        if (isMounted) {
          setSessionExists(result.exists);
          setIsLoading(false);
        }
      } catch (_error) {
        if (isMounted) setIsLoading(false);
      }
    }

    // Initial check
    checkCurrentStatus();

    // Set up polling every 10 seconds
    const interval = setInterval(checkCurrentStatus, 10000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [taskId, type]); // Include both taskId and type as dependencies

  // External function to check status (used by handleStartSession)
  async function checkStatus() {
    try {
      // Validate input before checking
      SessionInputSchema.parse({ taskId, type });
      const result = await checkSessionExists(taskId, type);
      setSessionExists(result.exists);
    } catch (error) {
      console.error('[CLAUDE BUTTON] Error checking session status:', error);
    }
  }

  // Start a new session
  async function handleStartSession() {
    console.log(`[CLAUDE BUTTON] Starting session for task ${taskId} with mode: ${selectedMode}`);
    setIsStarting(true);

    // First check if a session already exists
    const result = await checkSessionExists(taskId, type);

    if (result.exists) {
      const windowsList = result.windows.join(', ');
      const windowsInfo = result.windows.length > 0 ? ` (${windowsList})` : '';
      // Session already exists, show a toast notification
      addToast({
        type: 'info',
        title: 'Session Already Running',
        message: `Claude session for ${taskId} is already running in a terminal window${windowsInfo}.`,
        duration: 5000,
      });
      setIsStarting(false);
      setSessionExists(true);
      return;
    }

    try {
      // Use the SessionInput interface and validate the input
      const success = await startClaudeSession({ taskId, mode: selectedMode, type });
      console.log(
        `[CLAUDE BUTTON] Session start request result: ${success ? 'SUCCEEDED' : 'FAILED'}`
      );

      if (success) {
        addToast({
          type: 'success',
          title: 'Claude Session Started',
          message: `Successfully started Claude session for ${taskId}`,
          duration: 3000,
        });
      }

      // Check session status immediately after creation
      await checkStatus();
      setIsStarting(false);
    } catch (error) {
      console.error('[CLAUDE BUTTON] Failed to start session:', error);
      setIsStarting(false);

      // Show error toast
      addToast({
        type: 'error',
        title: 'Failed to Start Session',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 5000,
      });
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Button variant="ghost" disabled>
        Checking...
      </Button>
    );
  }

  // Session already exists
  if (sessionExists) {
    return (
      <Button variant="secondary" disabled className="session-active-btn">
        <span className="status-indicator" />
        Claude Session Running
      </Button>
    );
  }

  // No session exists yet
  return (
    <div className="inline-flex items-center gap-3">
      <div className="flex flex-col">
        <label htmlFor="claude-mode" className="text-xs mb-1 text-muted-foreground">
          Claude Mode
        </label>
        <select
          id="claude-mode"
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value)}
          disabled={isStarting}
          className="mode-selector"
          aria-label="Select Claude mode"
        >
          {modeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={handleStartSession}
        disabled={isStarting}
        variant="default"
        className="claude-session-start-btn"
      >
        {isStarting ? 'Starting...' : 'START CLAUDE SESSION'}
      </Button>
    </div>
  );
}
