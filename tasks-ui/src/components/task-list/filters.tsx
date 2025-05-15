import { useState, type ChangeEvent } from "react";
import { Button } from "../ui/button";
import type { TaskListFilter } from "../../lib/types";

interface FiltersProps {
  filters: TaskListFilter;
  onFilterChange: (filters: TaskListFilter) => void;
  statusOptions: string[];
  priorityOptions: string[];
  typeOptions: string[];
  tagOptions?: string[];
  assigneeOptions?: string[];
  phaseOptions?: string[];
  featureOptions?: string[];
  areaOptions?: string[];
}

export function TaskFilters({
  filters,
  onFilterChange,
  statusOptions,
  priorityOptions,
  typeOptions,
  tagOptions = [],
  assigneeOptions = [],
  phaseOptions = [],
  featureOptions = [],
  areaOptions = [],
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    onFilterChange({ ...filters, searchTerm });
  };

  const handleStatusChange = (status: string | undefined) => {
    onFilterChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: string | undefined) => {
    onFilterChange({ ...filters, priority });
  };

  const handleTypeChange = (type: string | undefined) => {
    onFilterChange({ ...filters, type });
  };

  const handleTagChange = (tag: string | undefined) => {
    onFilterChange({ ...filters, tag });
  };

  const handleAssigneeChange = (assignedTo: string | undefined) => {
    onFilterChange({ ...filters, assignedTo });
  };

  const handlePhaseChange = (phase: string | undefined) => {
    onFilterChange({ ...filters, phase });
  };
  
  const handleFeatureChange = (feature: string | undefined) => {
    // Clear area selection if a feature is selected
    const newFilters = { ...filters, feature };
    if (feature) {
      delete newFilters.area;
    }
    onFilterChange(newFilters);
  };

  const handleAreaChange = (area: string | undefined) => {
    // Clear feature selection if an area is selected
    const newFilters = { ...filters, area };
    if (area) {
      delete newFilters.feature;
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm("");
    onFilterChange({});
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearchSubmit}
          >
            Search
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide Filters" : "Show Filters"}
        </Button>
        {(filters.status || filters.priority || filters.type || filters.searchTerm || filters.assignedTo || filters.tag || filters.phase) && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-border rounded-md bg-card/50">
          <div>
            <label className="text-sm font-medium">Status</label>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="status-all"
                  checked={!filters.status}
                  onChange={() => handleStatusChange(undefined)}
                  className="mr-2"
                />
                <label htmlFor="status-all" className="text-sm">All</label>
              </div>
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center">
                  <input
                    type="radio"
                    id={`status-${status}`}
                    checked={filters.status === status}
                    onChange={() => handleStatusChange(status)}
                    className="mr-2"
                  />
                  <label htmlFor={`status-${status}`} className="text-sm">{status}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="priority-all"
                  checked={!filters.priority}
                  onChange={() => handlePriorityChange(undefined)}
                  className="mr-2"
                />
                <label htmlFor="priority-all" className="text-sm">All</label>
              </div>
              {priorityOptions.map((priority) => (
                <div key={priority} className="flex items-center">
                  <input
                    type="radio"
                    id={`priority-${priority}`}
                    checked={filters.priority === priority}
                    onChange={() => handlePriorityChange(priority)}
                    className="mr-2"
                  />
                  <label htmlFor={`priority-${priority}`} className="text-sm">{priority}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="type-all"
                  checked={!filters.type}
                  onChange={() => handleTypeChange(undefined)}
                  className="mr-2"
                />
                <label htmlFor="type-all" className="text-sm">All</label>
              </div>
              {typeOptions.map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="radio"
                    id={`type-${type}`}
                    checked={filters.type === type}
                    onChange={() => handleTypeChange(type)}
                    className="mr-2"
                  />
                  <label htmlFor={`type-${type}`} className="text-sm">{type}</label>
                </div>
              ))}
            </div>
          </div>

          {assigneeOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium">Assigned To</label>
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="assignee-all"
                    checked={!filters.assignedTo}
                    onChange={() => handleAssigneeChange(undefined)}
                    className="mr-2"
                  />
                  <label htmlFor="assignee-all" className="text-sm">All</label>
                </div>
                {assigneeOptions.map((assignee) => (
                  <div key={assignee} className="flex items-center">
                    <input
                      type="radio"
                      id={`assignee-${assignee}`}
                      checked={filters.assignedTo === assignee}
                      onChange={() => handleAssigneeChange(assignee)}
                      className="mr-2"
                    />
                    <label htmlFor={`assignee-${assignee}`} className="text-sm font-mono">{assignee}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {featureOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium">Feature</label>
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="feature-all"
                    checked={!filters.feature}
                    onChange={() => handleFeatureChange(undefined)}
                    className="mr-2"
                  />
                  <label htmlFor="feature-all" className="text-sm">All</label>
                </div>
                {featureOptions.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <input
                      type="radio"
                      id={`feature-${feature}`}
                      checked={filters.feature === feature}
                      onChange={() => handleFeatureChange(feature)}
                      className="mr-2"
                    />
                    <label htmlFor={`feature-${feature}`} className="text-sm">{feature.replace('FEATURE_', '')}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {areaOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium">Area</label>
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="area-all"
                    checked={!filters.area}
                    onChange={() => handleAreaChange(undefined)}
                    className="mr-2"
                  />
                  <label htmlFor="area-all" className="text-sm">All</label>
                </div>
                {areaOptions.map((area) => (
                  <div key={area} className="flex items-center">
                    <input
                      type="radio"
                      id={`area-${area}`}
                      checked={filters.area === area}
                      onChange={() => handleAreaChange(area)}
                      className="mr-2"
                    />
                    <label htmlFor={`area-${area}`} className="text-sm">{area.replace('AREA_', '')}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tagOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="tag-all"
                    checked={!filters.tag}
                    onChange={() => handleTagChange(undefined)}
                    className="mr-2"
                  />
                  <label htmlFor="tag-all" className="text-sm">All</label>
                </div>
                {tagOptions.map((tag) => (
                  <div key={tag} className="flex items-center">
                    <input
                      type="radio"
                      id={`tag-${tag}`}
                      checked={filters.tag === tag}
                      onChange={() => handleTagChange(tag)}
                      className="mr-2"
                    />
                    <label htmlFor={`tag-${tag}`} className="text-sm">{tag}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phaseOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium">Phase</label>
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="phase-all"
                    checked={!filters.phase}
                    onChange={() => handlePhaseChange(undefined)}
                    className="mr-2"
                  />
                  <label htmlFor="phase-all" className="text-sm">All</label>
                </div>
                {phaseOptions.map((phase) => (
                  <div key={phase} className="flex items-center">
                    <input
                      type="radio"
                      id={`phase-${phase}`}
                      checked={filters.phase === phase}
                      onChange={() => handlePhaseChange(phase)}
                      className="mr-2"
                    />
                    <label htmlFor={`phase-${phase}`} className="text-sm">{phase}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}