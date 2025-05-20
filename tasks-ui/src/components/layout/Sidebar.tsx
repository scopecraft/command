import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAreaContext } from '../../context/AreaContext';
import { useFeatureContext } from '../../context/FeatureContext';
import { usePhaseContext } from '../../context/PhaseContext';
import { useUIContext } from '../../context/UIContext';
import { routes } from '../../lib/routes';
import type { UIState } from '../../lib/types';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

type SectionHeaderProps = {
  title: string;
  section: keyof UIState['collapsedSections'];
  isCollapsed: boolean;
  onToggle: () => void;
  actionButton?: React.ReactNode;
};

function SectionHeader({
  title,
  section,
  isCollapsed,
  onToggle,
  actionButton,
}: SectionHeaderProps) {
  // Handle keyboard accessibility for the toggle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="p-4 border-b border-border flex justify-between items-center">
      <button
        type="button"
        className="flex items-center cursor-pointer gap-2 bg-transparent border-0 p-0 text-left"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={!isCollapsed}
        aria-controls={`${section}-content`}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-[var(--atlas-light)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--atlas-light)]" />
        )}
        <h2 className="text-sm font-medium text-[var(--atlas-light)] uppercase">{title}</h2>
      </button>
      {actionButton}
    </div>
  );
}

export function Sidebar() {
  const { ui, toggleSectionCollapsed } = useUIContext();
  const { phases, currentPhase, loading: phasesLoading, setCurrentPhase } = usePhaseContext();
  const {
    features,
    loading: featuresLoading,
    currentFeature,
    setCurrentFeature,
  } = useFeatureContext();
  const { areas, loading: areasLoading, currentArea, setCurrentArea } = useAreaContext();
  const [, navigate] = useLocation();

  // Add keyboard shortcuts for collapsing sections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when sidebar is open
      if (!ui.sidebarOpen) return;

      // Alt + Number shortcuts for collapsing sections
      if (e.altKey) {
        switch (e.key) {
          case '1':
            toggleSectionCollapsed('views');
            e.preventDefault();
            break;
          case '2':
            toggleSectionCollapsed('phases');
            e.preventDefault();
            break;
          case '3':
            toggleSectionCollapsed('features');
            e.preventDefault();
            break;
          case '4':
            toggleSectionCollapsed('areas');
            e.preventDefault();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ui.sidebarOpen, toggleSectionCollapsed]);

  // Handle phase selection and navigate to phase detail page
  const handlePhaseClick = (phaseId: string) => {
    console.log('Selected phase:', phaseId);
    setCurrentPhase(phaseId);
    // Navigate to phase detail view
    navigate(routes.phaseDetail(phaseId));
  };

  // Handle feature selection and navigate to feature detail page
  const handleFeatureClick = (featureId: string) => {
    console.log('Selected feature:', featureId);
    setCurrentFeature(featureId);
    // Clear current area selection
    if (currentArea) {
      setCurrentArea(null);
    }
    // Extract the ID without the FEATURE_ prefix
    const id = featureId.replace('FEATURE_', '');

    // Navigate to feature detail page, preserving phase context if a phase is selected
    let route = routes.featureDetail(id);
    if (currentPhase) {
      route += `?phase=${currentPhase.id}`;
    }
    navigate(route);
  };

  // Handle area selection and navigate to area detail page
  const handleAreaClick = (areaId: string) => {
    console.log('Selected area:', areaId);
    setCurrentArea(areaId);
    // Clear current feature selection
    if (currentFeature) {
      setCurrentFeature(null);
    }
    // Extract the ID without the AREA_ prefix
    const id = areaId.replace('AREA_', '');

    // Navigate to area detail page, preserving phase context if a phase is selected
    let route = routes.areaDetail(id);
    if (currentPhase) {
      route += `?phase=${currentPhase.id}`;
    }
    navigate(route);
  };

  if (!ui.sidebarOpen) return null;

  return (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col">
      <SectionHeader
        title="Views"
        section="views"
        isCollapsed={ui.collapsedSections.views}
        onToggle={() => toggleSectionCollapsed('views')}
      />
      <div
        id="views-content"
        className={cn(
          'p-2 border-b border-border overflow-hidden',
          ui.collapsedSections.views && 'h-0 p-0 border-b-0'
        )}
      >
        <ul className="space-y-1">
          <li>
            <Link href={routes.taskList}>
              <Button variant="ghost" className="w-full justify-start text-left normal-case">
                <span className="truncate">Task List</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href={routes.comparison}>
              <Button variant="ghost" className="w-full justify-start text-left normal-case">
                <span className="truncate">Progress Comparison</span>
              </Button>
            </Link>
          </li>
        </ul>
      </div>

      <SectionHeader
        title="Phases"
        section="phases"
        isCollapsed={ui.collapsedSections.phases}
        onToggle={() => toggleSectionCollapsed('phases')}
      />
      <div
        id="phases-content"
        className={cn(
          'overflow-y-auto p-2 border-b border-border',
          ui.collapsedSections.phases && 'h-0 p-0 border-b-0 overflow-hidden'
        )}
      >
        {phasesLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading phases...</div>
        ) : phases.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">No phases found</div>
        ) : (
          <ul className="space-y-1">
            {phases.map((phase) => (
              <li key={phase.id}>
                <Button
                  variant={currentPhase?.id === phase.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left normal-case',
                    currentPhase?.id === phase.id && 'bg-accent'
                  )}
                  onClick={() => handlePhaseClick(phase.id)}
                >
                  <span className="truncate">{phase.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SectionHeader
        title="Features"
        section="features"
        isCollapsed={ui.collapsedSections.features}
        onToggle={() => toggleSectionCollapsed('features')}
        actionButton={
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title="Create Feature"
            onClick={() => navigate(routes.featureCreate)}
          >
            +
          </Button>
        }
      />
      <div
        id="features-content"
        className={cn(
          'overflow-y-auto p-2 border-b border-border',
          ui.collapsedSections.features && 'h-0 p-0 border-b-0 overflow-hidden'
        )}
      >
        {featuresLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading features...</div>
        ) : features.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">No features found</div>
        ) : (
          <ul className="space-y-1">
            {features.map((feature) => (
              <li key={feature.id}>
                <Button
                  variant={currentFeature?.id === feature.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left normal-case',
                    currentFeature?.id === feature.id && 'bg-accent'
                  )}
                  onClick={() => handleFeatureClick(feature.id)}
                >
                  <span className="text-blue-500 mr-1">📦</span>
                  <span className="truncate">{feature.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SectionHeader
        title="Areas"
        section="areas"
        isCollapsed={ui.collapsedSections.areas}
        onToggle={() => toggleSectionCollapsed('areas')}
        actionButton={
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title="Create Area"
            onClick={() => navigate(routes.areaCreate)}
          >
            +
          </Button>
        }
      />
      <div
        id="areas-content"
        className={cn(
          'flex-1 overflow-y-auto p-2',
          ui.collapsedSections.areas && 'h-0 p-0 overflow-hidden flex-none'
        )}
      >
        {areasLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading areas...</div>
        ) : areas.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">No areas found</div>
        ) : (
          <ul className="space-y-1">
            {areas.map((area) => (
              <li key={area.id}>
                <Button
                  variant={currentArea?.id === area.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left normal-case',
                    currentArea?.id === area.id && 'bg-accent'
                  )}
                  onClick={() => handleAreaClick(area.id)}
                >
                  <span className="text-green-500 mr-1">🔷</span>
                  <span className="truncate">{area.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <Button
          variant="atlas"
          className="w-full"
          onClick={() => {
            navigate(routes.prompt);
          }}
        >
          <span className="text-[var(--atlas-light)] mr-1">💬</span> Claude Assistant
        </Button>
      </div>
    </aside>
  );
}
