/**
 * Format a date string (YYYY-MM-DD) into a more readable format
 * @param dateString The date string to format
 * @param options Formatting options
 * @returns Formatted date string or dash if date is falsy
 */
export function formatDate(
  dateString: string | undefined,
  options: {
    showYear?: boolean;
    showRelative?: boolean;
  } = { showYear: true, showRelative: false }
): string {
  if (!dateString) return '—';

  const date = new Date(dateString);

  // Check if the date is valid
  if (Number.isNaN(date.getTime())) return dateString;

  // Format the date
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: options.showYear ? 'numeric' : undefined,
  });

  const formattedDate = formatter.format(date);

  // Add relative time if requested
  if (options.showRelative) {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `${formattedDate} (Today)`;
    }
    if (diffDays === 1) {
      return `${formattedDate} (Yesterday)`;
    }
    if (diffDays > 1 && diffDays <= 7) {
      return `${formattedDate} (${diffDays} days ago)`;
    }
    if (diffDays < 0 && diffDays >= -7) {
      return `${formattedDate} (In ${Math.abs(diffDays)} days)`;
    }
  }

  return formattedDate;
}

/**
 * Checks if a task has any dependencies
 * @param dependsOn The depends_on array from the task
 * @returns True if the task has dependencies
 */
export function hasDependencies(dependsOn: string[] | undefined): boolean {
  return Array.isArray(dependsOn) && dependsOn.length > 0;
}

/**
 * Truncates a string to a specific length and adds ellipsis if needed
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
