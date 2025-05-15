import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAreaContext } from '../../context/AreaContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { useToast } from '../../hooks/useToast';
import { usePhaseContext } from '../../context/PhaseContext';
import type { Area } from '../../lib/types';

interface AreaFormProps {
  areaId?: string;
  isEdit?: boolean;
}

export function AreaFormView({ areaId, isEdit = false }: AreaFormProps) {
  const { createArea, updateArea, getAreaById, areas } = useAreaContext();
  const { phases } = usePhaseContext();
  const [, navigate] = useLocation();
  const toast = useToast();
  
  // Form state
  const [formData, setFormData] = useState<Partial<Area>>({
    name: '',
    title: '',
    description: '',
    status: '🟡 To Do',
    phase: phases[0]?.id || '',
    tags: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  // Load area data if editing
  useEffect(() => {
    if (isEdit && areaId) {
      const area = getAreaById(areaId);
      if (area) {
        setFormData({
          id: area.id,
          name: area.name,
          title: area.title || '',
          description: area.description || '',
          status: area.status || '🟡 To Do',
          phase: area.phase || phases[0]?.id || '',
          tags: area.tags || []
        });
      } else {
        toast.error('Area not found');
        navigate(routes.home);
      }
    }
  }, [isEdit, areaId, getAreaById, phases, navigate, toast]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if there was one
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Add a tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Don't add duplicate tags
    if (formData.tags?.includes(tagInput.trim())) {
      toast.warning('Tag already exists');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()]
    }));
    
    setTagInput('');
  };
  
  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (
      !isEdit && 
      areas.some(a => a.name.toLowerCase() === formData.name.toLowerCase())
    ) {
      newErrors.name = 'An area with this name already exists';
    }
    
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.phase) {
      newErrors.phase = 'Phase is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate proper ID for new areas if not editing
      let areaData = { ...formData } as Area;
      
      if (!isEdit) {
        // Format name for ID
        const nameForId = formData.name.replace(/[^a-zA-Z0-9]/g, '');
        areaData.id = `AREA_${nameForId}`;
      }
      
      const operation = isEdit ? updateArea : createArea;
      const result = await operation(areaData as Area);
      
      if (result.success) {
        toast.success(`Area ${isEdit ? 'updated' : 'created'} successfully`);
        navigate(isEdit ? routes.areaDetail(areaData.id.replace('AREA_', '')) : routes.home);
      } else {
        toast.error(result.message || `Failed to ${isEdit ? 'update' : 'create'} area`);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel form
  const handleCancel = () => {
    navigate(isEdit && areaId 
      ? routes.areaDetail(areaId.replace('AREA_', '')) 
      : routes.home
    );
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-xl font-semibold mb-6">
        {isEdit ? 'Edit Area' : 'Create Area'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Area Name
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isEdit} // Can't change name when editing
            className={`w-full p-2 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-border'
            } bg-background`}
            placeholder="MyAreaName"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used to identify the area in the system. Should be short, without spaces.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Display Title
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.title ? 'border-red-500' : 'border-border'
            } bg-background`}
            placeholder="My Area"
          />
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Human-readable title for the area.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-border rounded-md bg-background h-24"
            placeholder="Describe the area..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              <option value="🟡 To Do">🟡 To Do</option>
              <option value="🔵 In Progress">🔵 In Progress</option>
              <option value="🟢 Done">🟢 Done</option>
              <option value="⭕ Cancelled">⭕ Cancelled</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Phase
              <span className="text-red-500">*</span>
            </label>
            <select
              name="phase"
              value={formData.phase}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.phase ? 'border-red-500' : 'border-border'
              } bg-background`}
            >
              <option value="">Select a phase</option>
              {phases.map(phase => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
            {errors.phase && (
              <p className="text-red-500 text-xs">{errors.phase}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 p-2 border border-border rounded-md bg-background"
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags?.map(tag => (
              <div
                key={tag}
                className="bg-accent/80 flex items-center gap-1 text-sm px-2 py-1 rounded-md"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Area' : 'Create Area'}
          </Button>
        </div>
      </form>
    </div>
  );
}