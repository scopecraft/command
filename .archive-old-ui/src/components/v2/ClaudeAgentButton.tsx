import React from 'react';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ClaudeAgentButtonProps {
  onClick?: () => void;
  className?: string;
  taskId?: string;
}

export function ClaudeAgentButton({ onClick, className, taskId }: ClaudeAgentButtonProps) {
  const [sessionActive, setSessionActive] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);

  // Simulate session check (in real app, would check actual session status)
  React.useEffect(() => {
    if (taskId) {
      // Mock check - in real app would call checkSessionExists
      const mockSessionStatus = Math.random() > 0.7; // 30% chance of active session
      setSessionActive(mockSessionStatus);
    }
  }, [taskId]);

  const handleClick = async () => {
    if (sessionActive) {
      // Session already running, just notify
      console.log('Claude session already running for', taskId);
      return;
    }

    setIsStarting(true);
    
    // Simulate starting session
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSessionActive(true);
    setIsStarting(false);
    
    if (onClick) {
      onClick();
    }
  };

  // Session active state
  if (sessionActive) {
    return (
      <Button 
        variant="secondary" 
        disabled 
        className={cn("uppercase", className)}
      >
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
        Claude Session Running
      </Button>
    );
  }

  // Starting state
  if (isStarting) {
    return (
      <Button 
        variant="atlas" 
        disabled
        className={cn("uppercase", className)}
      >
        Starting...
      </Button>
    );
  }

  // Default state - ready to start
  return (
    <Button 
      variant="atlas" 
      onClick={handleClick}
      className={cn("uppercase group", className)}
    >
      Start Claude Agent
      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}