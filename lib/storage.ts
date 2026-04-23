// localStorage-backed storage — works in browser and in Capacitor WebView

const STORAGE_KEY = "fitlog-workouts";

// ============================================================
// Types
// ============================================================

export type LoggedSet = {
  setNumber: number;
  reps: string;
  weight: string;
  completed: boolean;
};

export type LoggedExercise = {
  name: string;
  note: string;
  sets: LoggedSet[];
  isCustom?: boolean;
};

export type WorkoutLog = {
  id: string;
  date: string;
  dayType: string;
  dayName: string;
  exercises: LoggedExercise[];
  notes: string;
  completedAt?: string;
};

// ============================================================
// Helpers
// ============================================================

export function getTodayDateString(): string {
  const today = new Date();
  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day   = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseRepsToSets(reps: string, setCount: number): string[] {
  const timesMatch = reps.match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  if (timesMatch) {
    const rep   = timesMatch[1];
    const count = parseInt(timesMatch[2]);
    return Array(count).fill(rep);
  }
  if (reps.includes(",")) {
    return reps.split(",").map(r => r.trim());
  }
  return Array(setCount).fill(reps);
}

// ============================================================
// localStorage CRUD
// ============================================================

function readAll(): Record<string, WorkoutLog> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, WorkoutLog>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Fetch all workout logs, newest first */
export async function getWorkoutLogs(): Promise<WorkoutLog[]> {
  const all = readAll();
  return Object.values(all).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Fetch a single workout log by date */
export async function getLogForDate(date: string): Promise<WorkoutLog | undefined> {
  const all = readAll();
  return Object.values(all).find(l => l.date === date);
}

/** Save (upsert) a workout log */
export async function saveWorkoutLog(log: WorkoutLog): Promise<void> {
  const all = readAll();
  all[log.id] = log;
  writeAll(all);
}

/** Delete a workout log */
export async function deleteWorkoutLog(id: string): Promise<void> {
  const all = readAll();
  delete all[id];
  writeAll(all);
}
