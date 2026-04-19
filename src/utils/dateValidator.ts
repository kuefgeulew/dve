export function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime());
}

export function isStale(dateStr: string, monthsThreshold: number): boolean {
  if (!isValidDate(dateStr)) return false;
  const docDate = new Date(dateStr);
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - monthsThreshold);
  return docDate < threshold;
}

export function isFarFuture(dateStr: string, daysThreshold: number): boolean {
  if (!isValidDate(dateStr)) return false;
  const docDate = new Date(dateStr);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  return docDate > threshold;
}

export function formatDate(dateStr: string): string {
  if (!isValidDate(dateStr)) return dateStr;
  return new Date(dateStr).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
