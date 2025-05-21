import React, { useState, useEffect } from 'react';
import { checkSessionExists, startClaudeSession, SessionInputSchema } from '../../lib/utils/tmux';
import { Button } from '../ui/button';
import { logger } from '../../observability/logger';
import './SessionButton.css';

interface ClaudeSessionButtonProps {
  taskId: string;
}

export function ClaudeSessionButton({ taskId }: ClaudeSessionButtonProps) {
  const [sessionExists, setSessionExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedMode, setSelectedMode] = useState("none");
  
  // Common mode options
  const modeOptions = [
    { value: "none", label: "Basic Claude" },
    { value: "05_implement", label: "Implementation" },
    { value: "review", label: "Code Review" },
    { value: "01_brainstorm-feature", label: "Brainstorm" },
  ];
  
  // Check session status on mount and periodically
  useEffect(() => {
    // Initial check
    checkStatus();
    
    // Set up polling every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, [taskId]);
  
  // Check if session exists
  function checkStatus() {
    try {
      logger.info(`Checking Claude session status`, { taskId });
      
      // Validate taskId before checking
      SessionInputSchema.parse({ taskId });
      const exists = checkSessionExists(taskId);
      
      logger.info(`Claude session status check`, { 
        taskId, 
        previousStatus: sessionExists,
        currentStatus: exists,
        changed: sessionExists !== exists 
      });
      
      setSessionExists(exists);
    } catch (error) {
      logger.error(`Error checking Claude session status`, { taskId, error });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Start a new session
  function handleStartSession() {
    logger.info(`Starting Claude session`, { taskId, mode: selectedMode });
    setIsStarting(true);
    
    try {
      // Use the SessionInput interface and validate the input
      const success = startClaudeSession({ taskId, mode: selectedMode });
      
      logger.info(`Claude session start request`, { 
        taskId, 
        mode: selectedMode,
        success,
        command: `./dispatch ${selectedMode} ${taskId} --no-interactive` 
      });
      
      // Wait a bit longer for tmux to create the session
      logger.debug(`Waiting for Claude session creation`, { taskId, mode: selectedMode });
      
      setTimeout(() => {
        logger.info(`Checking Claude session status after creation`, { taskId });
        checkStatus();
        setIsStarting(false);
      }, 1500);
    } catch (error) {
      logger.error(`Failed to start Claude session`, { taskId, mode: selectedMode, error });
      setIsStarting(false);
    }
  }
  
  // Loading state
  if (isLoading) {
    return <Button variant="ghost" disabled>Checking...</Button>;
  }
  
  // Session already exists
  if (sessionExists) {
    return (
      <Button variant="secondary" disabled className="session-active-btn">
        <span className="status-indicator"></span>
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
        {modeOptions.map(option => (
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
        {isStarting ? "Starting..." : "START CLAUDE SESSION"}
      </Button>
    </div>
  );
}