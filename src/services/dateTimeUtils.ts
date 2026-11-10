export function formatDayTime(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = dayNames[d.getDay()];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = monthNames[d.getMonth()];
  const dateNum = d.getDate();

  return `${day}, ${dateNum} ${month} • ${hours}:${minutes}`;
}

export function formatShortDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = dayNames[d.getDay()];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}, ${hours}:${minutes}`;
}

function getOverdueCountdown(diffMs: number): {
  text: string;
  isPast: boolean;
  isUrgent: boolean;
} {
  const elapsedMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  if (elapsedMinutes < 60) {
    return { text: `Overdue by ${elapsedMinutes}m`, isPast: true, isUrgent: true };
  }
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return { text: `Overdue by ${elapsedHours}h`, isPast: true, isUrgent: true };
}

export function getCountdownString(deadlineIso: string | null | undefined): {
  text: string;
  isPast: boolean;
  isUrgent: boolean;
} {
  if (!deadlineIso) {
    return { text: "", isPast: false, isUrgent: false };
  }

  const deadline = new Date(deadlineIso).getTime();
  if (isNaN(deadline)) {
    return { text: "", isPast: false, isUrgent: false };
  }

  const now = Date.now();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return getOverdueCountdown(diffMs);
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const isUrgent = diffMs < 1000 * 60 * 60 * 12; // less than 12h

  if (days > 0) {
    return { text: `${days}d ${hours}h left`, isPast: false, isUrgent: false };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m left`, isPast: false, isUrgent };
  }
  return { text: `${minutes}m left`, isPast: false, isUrgent: true };
}

export function toLocalDatetimeInputValue(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
