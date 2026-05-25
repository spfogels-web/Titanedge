// Calendar notes — stored per-date in localStorage. Format: { "YYYY-MM-DD": "note text" }.
// Real implementation: a `calendar_notes` table keyed by (user_id, date).

const STORAGE_KEY = "titanedge.calendar.notes";

export type NotesMap = Record<string, string>;

export function loadNotes(): NotesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotesMap) : {};
  } catch {
    return {};
  }
}

export function saveNotes(notes: NotesMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function dateKey(year: number, monthIdx: number, day: number): string {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Returns today's date as YYYY-MM-DD in a given timezone. Uses en-CA locale
// because that locale's default format is exactly YYYY-MM-DD.
export function todayKeyInTz(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
