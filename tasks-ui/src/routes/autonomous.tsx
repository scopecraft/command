import { createFileRoute } from '@tanstack/react-router';
import { AutonomousMonitor } from '../components/autonomous/AutonomousMonitor';

export const Route = createFileRoute('/autonomous')({
  component: AutonomousPage,
});

function AutonomousPage() {
  return <AutonomousMonitor />;
}