interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

/**
 * Connection status indicator component
 */
export function ConnectionStatus({ isConnected, isConnecting, error }: ConnectionStatusProps) {
  return (
    <>
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
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
      )}
    </>
  );
}