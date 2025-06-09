import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { WorkflowStateBadge } from '../v2/WorkflowStateBadge';
import { AutonomousSessionCard } from './AutonomousSessionCard';

interface SessionInfo {
  sessionName: string;
  taskId: string;
  parentId?: string;
  logFile: string;
  startTime: string;
  status: string;
  pid?: number;
  stats?: {
    messages: number;
    toolsUsed: string[];
    totalCost?: number;
    model?: string;
    lastOutput?: string;
    lastUpdate?: string;
  };
}

interface LogEntry {
  timestamp: string;
  taskId: string;
  content: string;
  type: 'output' | 'error' | 'tool';
}

// API client functions
async function fetchSessions(): Promise<SessionInfo[]> {
  const response = await fetch('/api/autonomous-sessions');
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function fetchLogs(limit = 50): Promise<LogEntry[]> {
  const response = await fetch(`/api/autonomous-sessions/logs?limit=${limit}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function fetchSessionDetails(
  taskId: string
): Promise<SessionInfo & { lastLogLines?: string[] }> {
  const response = await fetch(`/api/autonomous-sessions/${taskId}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function AutonomousMonitor() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['autonomous-sessions'],
    queryFn: fetchSessions,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Fetch logs
  const { data: logs = [] } = useQuery({
    queryKey: ['autonomous-logs'],
    queryFn: () => fetchLogs(50),
    refetchInterval: 2000,
  });

  // Group sessions by status
  const runningSessions = sessions.filter((s) => s.status === 'running');
  const waitingSessions = sessions.filter((s) => s.status === 'waiting_feedback');
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' || s.status === 'error'
  );

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'tool':
        return 'text-cyan-400';
      default:
        return 'text-foreground';
    }
  };

  const selectedSession = sessions.find((s) => s.sessionName === selectedSessionId);

  // Fetch detailed session info for selected session
  const { data: sessionDetails } = useQuery({
    queryKey: ['session-details', selectedSession?.taskId],
    queryFn: () =>
      selectedSession ? fetchSessionDetails(selectedSession.taskId) : Promise.resolve(null),
    enabled: !!selectedSession,
    refetchInterval: 2000,
  });

  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading autonomous sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Autonomous Tasks Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage autonomous task executions
          </p>
        </div>
      </div>

      {/* Session Columns */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Running */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-blue-500">⚡</span>
                <span className="font-semibold">Running</span>
              </div>
              <span className="text-muted-foreground">({runningSessions.length})</span>
            </div>
            <div className="space-y-3">
              {runningSessions.map((session) => (
                <AutonomousSessionCard
                  key={session.sessionName}
                  session={session}
                  variant="compact"
                  onClick={() => setSelectedSessionId(session.sessionName)}
                />
              ))}
              {runningSessions.length === 0 && (
                <div className="text-muted-foreground text-sm text-center py-8 border border-dashed rounded-lg">
                  No running sessions
                </div>
              )}
            </div>
          </div>

          {/* Waiting Feedback */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⏳</span>
                <span className="font-semibold">Waiting Feedback</span>
              </div>
              <span className="text-muted-foreground">({waitingSessions.length})</span>
            </div>
            <div className="space-y-3">
              {waitingSessions.map((session) => (
                <AutonomousSessionCard
                  key={session.sessionName}
                  session={session}
                  variant="compact"
                  onClick={() => setSelectedSessionId(session.sessionName)}
                />
              ))}
              {waitingSessions.length === 0 && (
                <div className="text-muted-foreground text-sm text-center py-8 border border-dashed rounded-lg">
                  No sessions waiting
                </div>
              )}
            </div>
          </div>

          {/* Completed/Error */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-green-500">✅</span>
                <span className="font-semibold">Completed</span>
              </div>
              <span className="text-muted-foreground">({completedSessions.length})</span>
            </div>
            <div className="space-y-3">
              {completedSessions.slice(0, 5).map((session) => (
                <AutonomousSessionCard
                  key={session.sessionName}
                  session={session}
                  variant="compact"
                  onClick={() => setSelectedSessionId(session.sessionName)}
                />
              ))}
              {completedSessions.length === 0 && (
                <div className="text-muted-foreground text-sm text-center py-8 border border-dashed rounded-lg">
                  No completed sessions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Session Details */}
        {selectedSession && (
          <div className="mt-8">
            <div className="bg-card border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-muted/30 px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Session Details</h2>
                <button
                  onClick={() => setSelectedSessionId(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close session details"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Session Info */}
              <div className="p-6">
                <AutonomousSessionCard
                  session={selectedSession}
                  variant="default"
                  className="border-0 p-0 hover:shadow-none"
                />

                {/* Last Activity */}
                {sessionDetails?.lastLogLines && sessionDetails.lastLogLines.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Recent Activity
                    </h4>
                    <div className="space-y-1 font-mono text-xs">
                      {sessionDetails.lastLogLines.map((line, i) => (
                        <div key={i} className="text-foreground opacity-80">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Commands Section */}
              <div className="bg-muted/10 border-t px-6 py-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Commands</h3>

                {selectedSession.status === 'waiting_feedback' && (
                  <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                      ⏳ Waiting for feedback
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground mt-1 w-20">Continue:</span>
                    <code className="text-xs bg-background px-3 py-2 rounded font-mono flex-1 select-all">
                      ./implement-auto --continue {selectedSession.taskId} "your message"
                    </code>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground mt-1 w-20">Interactive:</span>
                    <code className="text-xs bg-background px-3 py-2 rounded font-mono flex-1 select-all">
                      channelcoder -r {selectedSession.sessionName}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Combined Activity Log */}
        <div className="mt-8">
          <div className="bg-card border rounded-lg">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Combined Activity Log</h2>
              <p className="text-sm text-muted-foreground">Recent activity across all sessions</p>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-muted-foreground text-center py-4">No activity yet...</div>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {logs.map((log, i) => (
                    <div key={i} className={`${getLogColor(log.type)} flex gap-2`}>
                      <span className="text-muted-foreground w-32 truncate">[{log.taskId}]</span>
                      <span className="flex-1">{log.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {sessions.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              No autonomous sessions running. Start one with:
            </p>
            <code className="text-sm bg-card px-4 py-2 rounded font-mono">
              ./implement-auto &lt;taskId&gt;
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
