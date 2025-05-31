import { Button } from '../ui/button';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

/**
 * Connection status indicator component
 */
export function ConnectionStatus({
  isConnected,
  isConnecting,
  error,
  onConnect,
  onDisconnect,
}: ConnectionStatusProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Status */}
        <div className="text-sm">
          Status:{' '}
          <span
            className={`inline-flex items-center ${
              isConnected ? 'text-green-600' : isConnecting ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="mr-1">{isConnected ? '●' : isConnecting ? '◉' : '○'}</span>
            {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-2 text-sm">{error}</div>
        )}
      </div>

      {/* Connection Controls */}
      <div className="flex gap-2">
        {!isConnected && !isConnecting && (
          <Button onClick={onConnect} variant="atlas" size="sm">
            Connect
          </Button>
        )}
        {isConnected && (
          <Button onClick={onDisconnect} variant="secondary" size="sm">
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
}
