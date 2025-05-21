import React, { useState, useEffect } from 'react';
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
        const exists = await checkSessionExists(taskId, type);

        if (isMounted) {
          setSessionExists(exists);
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
      const exists = await checkSessionExists(taskId, type);
      setSessionExists(exists);
    } catch (error) {
      console.error('[CLAUDE BUTTON] Error checking session status:', error);
    }
  }

  // Start a new session
  async function handleStartSession() {
    console.log(`[CLAUDE BUTTON] Starting session for task ${taskId} with mode: ${selectedMode}`);
    setIsStarting(true);

    try {
      // Use the SessionInput interface and validate the input
      const success = await startClaudeSession({ taskId, mode: selectedMode, type });
      console.log(
        `[CLAUDE BUTTON] Session start request result: ${success ? 'SUCCEEDED' : 'FAILED'}`
      );

      // Check session status immediately after creation
      await checkStatus();
      setIsStarting(false);
    } catch (error) {
      console.error('[CLAUDE BUTTON] Failed to start session:', error);
      setIsStarting(false);
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
