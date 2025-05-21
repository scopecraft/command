import React, { useState, useEffect } from 'react';
import { checkSessionExists, startClaudeSession, SessionInputSchema } from '../../lib/utils/tmux';
import { Button } from '../ui/button';
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
      // Validate taskId before checking
      SessionInputSchema.parse({ taskId });
      const exists = checkSessionExists(taskId);
      setSessionExists(exists);
    } catch (error) {
      console.error("Error checking session status:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Start a new session
  function handleStartSession() {
    setIsStarting(true);
    
    try {
      // Use the SessionInput interface and validate the input
      startClaudeSession({ taskId, mode: selectedMode });
      
      // Wait a second for tmux to create the session
      setTimeout(() => {
        checkStatus();
        setIsStarting(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to start session:", error);
      setIsStarting(false);
    }
  }
  
  // Loading state
  if (isLoading) {
    return <div className="claude-session-button loading">Checking session status...</div>;
  }
  
  // Session already exists
  if (sessionExists) {
    return (
      <div className="claude-session-button existing">
        <span className="status-indicator"></span>
        Claude Session Running
      </div>
    );
  }
  
  // No session exists yet
  return (
    <div className="claude-session-button">
      <select 
        value={selectedMode}
        onChange={(e) => setSelectedMode(e.target.value)}
        disabled={isStarting}
        className="mode-selector"
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
        variant="outline"
        size="sm"
      >
        {isStarting ? "Starting..." : "Start Claude Session"}
      </Button>
    </div>
  );
}