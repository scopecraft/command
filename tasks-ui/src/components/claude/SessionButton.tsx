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
      console.log(`[CLAUDE BUTTON] Checking status for task: ${taskId}`);
      
      // Validate taskId before checking
      SessionInputSchema.parse({ taskId });
      const exists = checkSessionExists(taskId);
      
      console.log(`[CLAUDE BUTTON] Session status changed: ${sessionExists} -> ${exists}`);
      setSessionExists(exists);
    } catch (error) {
      console.error("[CLAUDE BUTTON] Error checking session status:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Start a new session
  function handleStartSession() {
    console.log(`[CLAUDE BUTTON] Starting session for task ${taskId} with mode: ${selectedMode}`);
    setIsStarting(true);
    
    try {
      // Use the SessionInput interface and validate the input
      const success = startClaudeSession({ taskId, mode: selectedMode });
      console.log(`[CLAUDE BUTTON] Session start request result: ${success ? 'INITIATED' : 'FAILED'}`);
      
      // Wait a bit longer for tmux to create the session
      console.log(`[CLAUDE BUTTON] Waiting for session to be created...`);
      setTimeout(() => {
        console.log(`[CLAUDE BUTTON] Checking session status after creation attempt`);
        checkStatus();
        setIsStarting(false);
      }, 1500);
    } catch (error) {
      console.error("[CLAUDE BUTTON] Failed to start session:", error);
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