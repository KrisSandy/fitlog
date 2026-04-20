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

const STORAGE_KEY = "fitlog-workouts";

export function getWorkoutLogs(): WorkoutLog[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWorkoutLog(log: WorkoutLog): void {
  if (typeof window === "undefined") return;
  try {
    const logs = getWorkoutLogs();
    const existingIndex = logs.findIndex(l => l.id === log.id);
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    console.error("Failed to save workout log");
  }
}

export function getLogForDate(date: string): WorkoutLog | undefined {
  if (typeof window === "undefined") return undefined;
  const logs = getWorkoutLogs();
  return logs.find(l => l.date === date);
}

export function deleteWorkoutLog(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const logs = getWorkoutLogs();
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    console.error("Failed to delete workout log");
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse routine reps string into per-set values.
 * "12,10,10,10" → ["12","10","10","10"]
 * "12×3"        → ["12","12","12"]
 * "45 sec"      → ["45 sec","45 sec","45 sec"] (needs setCount)
 */
export function parseRepsToSets(reps: string, setCount: number): string[] {
  // Handle "NxM" or "N×M" format
  const timesMatch = reps.match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  if (timesMatch) {
    const rep = timesMatch[1];
    const count = parseInt(timesMatch[2]);
    return Array(count).fill(rep);
  }

  // Handle comma-separated "12,10,10,10"
  if (reps.includes(",")) {
    return reps.split(",").map(r => r.trim());
  }

  // Fallback: repeat the same value for each set
  return Array(setCount).fill(reps);
}
