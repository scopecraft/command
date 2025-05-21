import {
  Code,
  Layout,
  Terminal,
  Bot,
  Server,
  Search,
  FileSpreadsheet,
  FileText,
  Circle
} from 'lucide-react';
import { DevelopmentMode } from '../../lib/types/worktree';
import { cn } from '../../lib/utils';

interface ModeIndicatorProps {
  mode: DevelopmentMode;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ModeIndicator({ 
  mode, 
  showLabel = false, 
  size = 'md',
  className 
}: ModeIndicatorProps) {
  // Size configuration for icons
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';
  
  // Get icon and color based on mode
  const getIconAndColor = () => {
    switch (mode) {
      case DevelopmentMode.TYPESCRIPT:
        return { icon: <Code className={cn(iconSize, "mr-1 text-blue-400")} />, color: 'text-blue-400' };
      case DevelopmentMode.UI:
        return { icon: <Layout className={cn(iconSize, "mr-1 text-purple-400")} />, color: 'text-purple-400' };
      case DevelopmentMode.CLI:
        return { icon: <Terminal className={cn(iconSize, "mr-1 text-green-400")} />, color: 'text-green-400' };
      case DevelopmentMode.MCP:
        return { icon: <Bot className={cn(iconSize, "mr-1 text-amber-400")} />, color: 'text-amber-400' };
      case DevelopmentMode.DEVOPS:
        return { icon: <Server className={cn(iconSize, "mr-1 text-red-400")} />, color: 'text-red-400' };
      case DevelopmentMode.CODEREVIEW:
        return { icon: <Search className={cn(iconSize, "mr-1 text-cyan-400")} />, color: 'text-cyan-400' };
      case DevelopmentMode.PLANNING:
        return { icon: <FileSpreadsheet className={cn(iconSize, "mr-1 text-indigo-400")} />, color: 'text-indigo-400' };
      case DevelopmentMode.DOCUMENTATION:
        return { icon: <FileText className={cn(iconSize, "mr-1 text-yellow-400")} />, color: 'text-yellow-400' };
      default:
        return { icon: <Circle className={cn(iconSize, "mr-1 text-gray-400")} />, color: 'text-gray-400' };
    }
  };

  const { icon, color } = getIconAndColor();
  const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

  return (
    <div className={cn("flex items-center", className)}>
      {icon}
      {showLabel && <span className={cn(fontSize, color)}>{modeLabel}</span>}
    </div>
  );
}