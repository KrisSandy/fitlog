export type Exercise = {
  name: string;
  sets: number;
  weight: string;
  reps: string;
  note: string;
};

export type Routine = {
  id: string;
  name: string;
  type: string;
  color: string;
  glow: string;
  icon: string;
  muscles: string[];
  exercises: Exercise[];
};

export const routines: Routine[] = [
  {
    id: "push", name: "Push", type: "push",
    color: "#f97316", glow: "rgba(249,115,22,0.2)", icon: "⬆️",
    muscles: ["Chest", "Shoulders", "Triceps"],
    exercises: [
      { name: "Bench Press (Barbell)", sets: 4, weight: "20→25kg", reps: "12,10,10,10", note: "Warm up at 20kg first" },
      { name: "Incline DB Bench Press", sets: 3, weight: "8kg", reps: "12×3", note: "Step up from 6kg" },
      { name: "Shoulder Press (DB)", sets: 3, weight: "8kg", reps: "10×3", note: "Step up from 6kg" },
      { name: "Cable Fly Crossovers", sets: 3, weight: "10kg", reps: "12×3", note: "No jumping to 15kg" },
      { name: "Lateral Raise (DB)", sets: 3, weight: "6kg", reps: "12×3", note: "Add 2 reps vs before" },
      { name: "Triceps Pushdown", sets: 3, weight: "25kg", reps: "12,10,10", note: "Do BEFORE flys" },
    ]
  },
  {
    id: "pull", name: "Pull", type: "pull",
    color: "#3b82f6", glow: "rgba(59,130,246,0.2)", icon: "⬇️",
    muscles: ["Back", "Biceps", "Rear Delts"],
    exercises: [
      { name: "Cable Row V-Grip", sets: 4, weight: "35→45kg", reps: "12×4", note: "Build toward 50kg" },
      { name: "Lat Pulldown", sets: 4, weight: "30→40kg", reps: "12,12,10,10", note: "You've hit 40kg cleanly" },
      { name: "Bicep Curl (Cable)", sets: 3, weight: "20kg", reps: "12×3", note: "Solid, maintain this" },
      { name: "Hammer Curl (DB)", sets: 3, weight: "8kg", reps: "12×3", note: "Step up from 6kg" },
      { name: "Face Pull", sets: 4, weight: "15kg", reps: "12×4", note: "Keep this habit!" },
    ]
  },
  {
    id: "legs", name: "Legs", type: "legs",
    color: "#22c55e", glow: "rgba(34,197,94,0.2)", icon: "🦵",
    muscles: ["Quads", "Hamstrings", "Calves", "Core"],
    exercises: [
      { name: "Leg Press (Machine)", sets: 4, weight: "30→40kg", reps: "12,10,10,10", note: "Start light, focus on form" },
      { name: "Leg Extension", sets: 3, weight: "Light", reps: "12×3", note: "Feel the quad contraction" },
      { name: "Leg Curl", sets: 3, weight: "Light", reps: "12×3", note: "Slow on way down" },
      { name: "Calf Raise", sets: 3, weight: "BW", reps: "15×3", note: "Pause at top" },
      { name: "Plank", sets: 3, weight: "BW", reps: "45 sec", note: "Core foundation" },
    ]
  },
  {
    id: "full", name: "Full Body", type: "full",
    color: "#a855f7", glow: "rgba(168,85,247,0.2)", icon: "💪",
    muscles: ["Chest", "Back", "Shoulders"],
    exercises: [
      { name: "Bench Press (Barbell)", sets: 3, weight: "25kg", reps: "10×3", note: "No warm-up set needed" },
      { name: "Shoulder Press (DB)", sets: 3, weight: "8kg", reps: "10×3", note: "Reinforce step up" },
      { name: "Lat Pulldown", sets: 3, weight: "35kg", reps: "12×3", note: "Volume work" },
      { name: "Seated Cable Row", sets: 3, weight: "40kg", reps: "12×3", note: "Moderate, not max" },
      { name: "Face Pull", sets: 3, weight: "15kg", reps: "12×3", note: "Shoulder health" },
      { name: "Bicep Curl (DB)", sets: 3, weight: "6→8kg", reps: "12×3", note: "Test 8kg here" },
    ]
  },
];

export function getRoutineById(id: string): Routine | undefined {
  return routines.find(r => r.id === id);
}

export function getColorForRoutineType(type: string): string {
  const r = routines.find(rt => rt.type === type);
  return r?.color || "#6b7280";
}
