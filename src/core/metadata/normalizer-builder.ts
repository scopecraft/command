/**
 * Schema-driven normalizer builder
 *
 * Creates efficient lookup maps for normalizing user input to canonical values
 * based on metadata schema definitions including aliases
 */

import type { MetadataValue } from './types.js';

/**
 * Builds a normalization map from metadata values
 * Maps all variations (name, label, emoji, aliases) to canonical name
 *
 * @param values Array of metadata values from schema
 * @returns Map for O(1) normalization lookups
 */
export function buildNormalizerMap(values: MetadataValue[]): Map<string, string> {
  const normalizer = new Map<string, string>();

  for (const value of values) {
    // Add canonical name (exact match)
    normalizer.set(value.name.toLowerCase(), value.name);

    // Add label variation
    normalizer.set(value.label.toLowerCase(), value.name);

    // Add emoji variation if present
    if (value.emoji) {
      normalizer.set(value.emoji.toLowerCase(), value.name);
    }

    // Add all aliases
    if (value.aliases) {
      for (const alias of value.aliases) {
        normalizer.set(alias.toLowerCase(), value.name);
      }
    }
  }

  return normalizer;
}

/**
 * Creates a normalizer function using a pre-built map
 *
 * @param normalizerMap The lookup map built from schema
 * @param defaultValue The default value when input is null/undefined
 * @param fieldName The field name for error messages
 * @returns Normalizer function that validates and normalizes input
 */
export function createNormalizer(
  normalizerMap: Map<string, string>,
  validValues: string[],
  defaultValue: string,
  fieldName: string
): (input: string | undefined | null) => string {
  return (input: string | undefined | null): string => {
    // Handle missing values - use default
    if (!input) {
      return defaultValue;
    }

    const lowerInput = input.toLowerCase().trim();

    // Try exact match first (most common case)
    const normalized = normalizerMap.get(lowerInput);
    if (normalized) {
      return normalized;
    }

    // Try partial match as fallback
    // This handles cases like "feat" matching "feature"
    for (const [key, value] of normalizerMap.entries()) {
      if (key.includes(lowerInput) || lowerInput.includes(key)) {
        return value;
      }
    }

    // No match found - throw error with valid options
    throw new Error(
      `Invalid ${fieldName} "${input}". Valid options are: ${validValues.join(', ')}`
    );
  };
}
