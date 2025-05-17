import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Area, Feature } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deduplicates Feature or Area items across phases
 * Returns items with the same name grouped together with phases array populated
 */
export function deduplicateByName<T extends Feature | Area>(items: T[]): T[] {
  // Create a map to group items by name
  const itemMap = new Map<string, T>();

  // Process each item
  items.forEach((item) => {
    const existingItem = itemMap.get(item.name);

    if (!existingItem) {
      // First time seeing this item, add it to the map
      // Initialize phases array if needed
      const phases = item.phase ? [item.phase] : [];
      itemMap.set(item.name, { ...item, phases });
    } else {
      // Item with this name already exists, add this phase to its phases array
      if (item.phase && !existingItem.phases?.includes(item.phase)) {
        const phases = existingItem.phases || [];
        itemMap.set(item.name, {
          ...existingItem,
          phases: [...phases, item.phase],
        });
      }
    }
  });

  // Convert map back to array
  return Array.from(itemMap.values());
}
