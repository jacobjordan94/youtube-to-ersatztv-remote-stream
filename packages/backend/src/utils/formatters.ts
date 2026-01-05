export function convertIso8601ToDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return '00:00:00';
  }

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

export function padDurationToInterval(duration: string, intervalMinutes: number): string {
  // Parse HH:MM:SS format
  const [hours, minutes, seconds] = duration.split(':').map(Number);

  // Convert to total minutes
  const totalMinutes = hours * 60 + minutes + (seconds > 0 ? 1 : 0);

  // Round up to nearest interval
  const paddedMinutes = Math.ceil(totalMinutes / intervalMinutes) * intervalMinutes;

  // Convert back to HH:MM:SS
  const paddedHours = Math.floor(paddedMinutes / 60);
  const paddedMins = paddedMinutes % 60;

  return [paddedHours, paddedMins, 0].map((v) => String(v).padStart(2, '0')).join(':');
}
