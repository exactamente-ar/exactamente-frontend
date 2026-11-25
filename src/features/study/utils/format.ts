const pad = (n: number) => String(n).padStart(2, '0');

/** Countdown as mm:ss. Minutes are not wrapped, so a 1 h focus reads 60:00. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
}

/** Overtime counts up, as +mm:ss. */
export function formatOvertime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return `+${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
}

/** Studied time as "1 h 40 min", "25 min" or "1 h". */
export function formatMinutes(totalMinutes: number): string {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

/** A difference in minutes: "+2 h 10 min", "−45 min" (true minus sign), "0 min". */
export function formatSignedDuration(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded === 0) return formatMinutes(0);
  return `${rounded > 0 ? '+' : '−'}${formatMinutes(Math.abs(rounded))}`;
}

/** Goal hours, with the decimal comma used across the site: "12 h", "7,5 h". */
export function formatHours(hours: number): string {
  return `${String(hours).replace('.', ',')} h`;
}

const unit = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`;

/** For screen readers: "49 minutos", "8 minutos 12 segundos". */
export function spokenDuration(ms: number, withSeconds = false): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(unit(hours, 'hora', 'horas'));
  if (minutes > 0) parts.push(unit(minutes, 'minuto', 'minutos'));
  if (withSeconds && seconds > 0) parts.push(unit(seconds, 'segundo', 'segundos'));
  if (parts.length > 0) return parts.join(' ');
  return withSeconds ? '0 segundos' : 'menos de un minuto';
}
