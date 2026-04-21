import { createClient } from "@/lib/supabase";

// ============================================
// Types (unchanged interface for components)
// ============================================

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

// ============================================
// Helpers
// ============================================

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseRepsToSets(reps: string, setCount: number): string[] {
  const timesMatch = reps.match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  if (timesMatch) {
    const rep = timesMatch[1];
    const count = parseInt(timesMatch[2]);
    return Array(count).fill(rep);
  }
  if (reps.includes(",")) {
    return reps.split(",").map(r => r.trim());
  }
  return Array(setCount).fill(reps);
}

// ============================================
// Supabase CRUD
// ============================================

async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Fetch all workout logs for the current user */
export async function getWorkoutLogs(): Promise<WorkoutLog[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const supabase = createClient();

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error || !workouts) return [];

  // Fetch exercises and sets for all workouts in parallel
  const logs: WorkoutLog[] = await Promise.all(
    workouts.map(async (w) => {
      const { data: exercises } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", w.id)
        .order("sort_order", { ascending: true });

      const loggedExercises: LoggedExercise[] = await Promise.all(
        (exercises || []).map(async (ex) => {
          const { data: sets } = await supabase
            .from("sets")
            .select("*")
            .eq("exercise_id", ex.id)
            .order("set_number", { ascending: true });

          return {
            name: ex.name,
            note: ex.note || "",
            isCustom: ex.is_custom || false,
            sets: (sets || []).map((s) => ({
              setNumber: s.set_number,
              reps: s.reps,
              weight: s.weight,
              completed: s.completed,
            })),
          };
        })
      );

      return {
        id: w.id,
        date: w.date,
        dayType: w.day_type,
        dayName: w.day_name,
        exercises: loggedExercises,
        notes: w.notes || "",
        completedAt: w.completed_at || undefined,
      };
    })
  );

  return logs;
}

/** Fetch a single workout log by date */
export async function getLogForDate(date: string): Promise<WorkoutLog | undefined> {
  const userId = await getCurrentUserId();
  if (!userId) return undefined;

  const supabase = createClient();
  const workoutId = `workout-${userId.slice(0, 8)}-${date}`;

  const { data: w } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .single();

  if (!w) return undefined;

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("workout_id", w.id)
    .order("sort_order", { ascending: true });

  const loggedExercises: LoggedExercise[] = await Promise.all(
    (exercises || []).map(async (ex) => {
      const { data: sets } = await supabase
        .from("sets")
        .select("*")
        .eq("exercise_id", ex.id)
        .order("set_number", { ascending: true });

      return {
        name: ex.name,
        note: ex.note || "",
        isCustom: ex.is_custom || false,
        sets: (sets || []).map((s) => ({
          setNumber: s.set_number,
          reps: s.reps,
          weight: s.weight,
          completed: s.completed,
        })),
      };
    })
  );

  return {
    id: w.id,
    date: w.date,
    dayType: w.day_type,
    dayName: w.day_name,
    exercises: loggedExercises,
    notes: w.notes || "",
    completedAt: w.completed_at || undefined,
  };
}

/** Save (upsert) a workout log — deletes old exercises/sets and re-creates them */
export async function saveWorkoutLog(log: WorkoutLog): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = createClient();
  const workoutId = `workout-${userId.slice(0, 8)}-${log.date}`;

  // 1. Upsert the workout row
  await supabase
    .from("workouts")
    .upsert({
      id: workoutId,
      user_id: userId,
      date: log.date,
      day_type: log.dayType,
      day_name: log.dayName,
      notes: log.notes,
      completed_at: log.completedAt || null,
    }, { onConflict: "id" });

  // 2. Delete existing exercises (cascades to sets)
  await supabase
    .from("exercises")
    .delete()
    .eq("workout_id", workoutId);

  // 3. Insert exercises and sets
  for (let i = 0; i < log.exercises.length; i++) {
    const ex = log.exercises[i];

    const { data: insertedEx } = await supabase
      .from("exercises")
      .insert({
        workout_id: workoutId,
        name: ex.name,
        note: ex.note,
        is_custom: ex.isCustom || false,
        sort_order: i,
      })
      .select("id")
      .single();

    if (insertedEx) {
      const setsToInsert = ex.sets.map((s) => ({
        exercise_id: insertedEx.id,
        set_number: s.setNumber,
        reps: s.reps,
        weight: s.weight,
        completed: s.completed,
      }));

      if (setsToInsert.length > 0) {
        await supabase.from("sets").insert(setsToInsert);
      }
    }
  }
}

/** Delete a workout log */
export async function deleteWorkoutLog(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = createClient();
  await supabase
    .from("workouts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
