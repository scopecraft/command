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
}

export function ClaudeSessionButton({ taskId }: ClaudeSessionButtonProps) {
  const [sessionExists, setSessionExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedMode, setSelectedMode] = useState('none');

  // Common mode options
  const modeOptions = [
    { value: 'none', label: 'Basic Claude' },
    { value: '05_implement', label: 'Implementation' },
    { value: 'review', label: 'Code Review' },
    { value: '01_brainstorm-feature', label: 'Brainstorm' },
  ];

  // Check session status on mount and periodically
  useEffect(() => {
    let isMounted = true;

    // Simple function to check session status
    async function checkCurrentStatus() {
      if (!isMounted) return;

      try {
        const exists = await checkSessionExists(taskId);

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
  }, [taskId]); // We only need taskId as a dependency

  // External function to check status (used by handleStartSession)
  async function checkStatus() {
    try {
      // Validate taskId before checking
      SessionInputSchema.parse({ taskId });
      const exists = await checkSessionExists(taskId);
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
      const success = await startClaudeSession({ taskId, mode: selectedMode });
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
      <select
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
