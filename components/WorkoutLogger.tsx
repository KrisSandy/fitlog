"use client";
import { useState, useEffect } from "react";
import { routines, type Routine } from "@/lib/routineData";
import {
  saveWorkoutLog, getLogForDate, getTodayDateString, parseRepsToSets,
  type LoggedExercise, type WorkoutLog,
} from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import {
  ChevronLeft, ChevronRight, Check, Plus, X,
  ArrowUp, ArrowDown, Activity, Zap, Dumbbell,
  FileText, Save, RefreshCw,
} from "lucide-react";

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const EXERCISE_CATALOG = [
  { group: "Chest", color: "#f97316", exercises: [
    { name: "Bench Press (Barbell)", sets: 4, reps: "10", weight: "25kg" },
    { name: "Incline DB Press",      sets: 3, reps: "12", weight: "10kg" },
    { name: "Cable Fly Crossovers",  sets: 3, reps: "12", weight: "10kg" },
    { name: "Chest Dips",            sets: 3, reps: "10", weight: "BW"   },
    { name: "Push-Ups",              sets: 3, reps: "15", weight: "BW"   },
  ]},
  { group: "Back", color: "#3b82f6", exercises: [
    { name: "Lat Pulldown",          sets: 4, reps: "12", weight: "35kg" },
    { name: "Cable Row V-Grip",      sets: 4, reps: "12", weight: "40kg" },
    { name: "Seated Cable Row",      sets: 3, reps: "12", weight: "35kg" },
    { name: "Barbell Row",           sets: 4, reps: "10", weight: "30kg" },
    { name: "Pull-Ups",              sets: 3, reps: "8",  weight: "BW"   },
  ]},
  { group: "Shoulders", color: "#f59e0b", exercises: [
    { name: "Shoulder Press (DB)",   sets: 3, reps: "10", weight: "8kg"  },
    { name: "Lateral Raise (DB)",    sets: 3, reps: "12", weight: "6kg"  },
    { name: "Face Pull",             sets: 4, reps: "12", weight: "15kg" },
    { name: "Front Raise (DB)",      sets: 3, reps: "12", weight: "6kg"  },
    { name: "Rear Delt Fly",         sets: 3, reps: "12", weight: "6kg"  },
  ]},
  { group: "Arms", color: "#ec4899", exercises: [
    { name: "Bicep Curl (Cable)",            sets: 3, reps: "12", weight: "20kg" },
    { name: "Bicep Curl (DB)",               sets: 3, reps: "12", weight: "8kg"  },
    { name: "Hammer Curl (DB)",              sets: 3, reps: "12", weight: "8kg"  },
    { name: "Triceps Pushdown",              sets: 3, reps: "12", weight: "25kg" },
    { name: "Overhead Tricep Extension",     sets: 3, reps: "12", weight: "10kg" },
    { name: "Skull Crushers",                sets: 3, reps: "10", weight: "15kg" },
  ]},
  { group: "Legs", color: "#22c55e", exercises: [
    { name: "Leg Press (Machine)",      sets: 4, reps: "12", weight: "40kg" },
    { name: "Leg Extension",            sets: 3, reps: "12", weight: "20kg" },
    { name: "Leg Curl",                 sets: 3, reps: "12", weight: "20kg" },
    { name: "Squat (Barbell)",          sets: 4, reps: "10", weight: "30kg" },
    { name: "Bulgarian Split Squat",    sets: 3, reps: "10", weight: "8kg"  },
    { name: "Calf Raise",               sets: 3, reps: "15", weight: "BW"   },
    { name: "Romanian Deadlift",        sets: 3, reps: "10", weight: "25kg" },
  ]},
  { group: "Core", color: "#a855f7", exercises: [
    { name: "Plank",               sets: 3, reps: "45 sec", weight: "BW"   },
    { name: "Cable Crunch",        sets: 3, reps: "15",     weight: "20kg" },
    { name: "Hanging Leg Raise",   sets: 3, reps: "12",     weight: "BW"   },
    { name: "Ab Wheel Rollout",    sets: 3, reps: "10",     weight: "BW"   },
  ]},
];

function RoutineIcon({ type, size = 20, color }: { type: string; size?: number; color: string }) {
  const props = { size, color, strokeWidth: 2.5 };
  if (type === "push") return <ArrowUp {...props} />;
  if (type === "pull") return <ArrowDown {...props} />;
  if (type === "legs") return <Activity {...props} />;
  if (type === "full") return <Zap {...props} />;
  return <Dumbbell {...props} />;
}

function formatDateDisplay(dateStr: string): { weekday: string; date: string } {
  if (!dateStr) return { weekday: "", date: "" };
  const d = new Date(dateStr + "T00:00:00");
  const weekday = WEEKDAYS[d.getDay()].toUpperCase();
  const date = d.toLocaleString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  return { weekday, date };
}

function buildLogFromRoutine(dateStr: string, routine: Routine): WorkoutLog {
  return {
    id: `workout-${dateStr}`, date: dateStr, dayType: routine.type, dayName: routine.name,
    exercises: routine.exercises.map(ex => {
      const rpsArr = parseRepsToSets(ex.reps, ex.sets);
      return {
        name: ex.name, note: ex.note,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          reps: rpsArr[i] || rpsArr[rpsArr.length - 1] || "10",
          weight: ex.weight, completed: false,
        })),
      };
    }),
    notes: "",
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10, padding: "7px 8px", color: "#f0f0fa", fontSize: 13,
  outline: "none", fontFamily: "inherit", textAlign: "center", transition: "border-color 0.2s ease",
};

export default function WorkoutLogger() {
  const [currentDate, setCurrentDate] = useState("");
  const [log, setLog]                 = useState<WorkoutLog | null>(null);
  const [picking, setPicking]         = useState(false);
  const [notes, setNotes]             = useState("");
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [customName, setCustomName]   = useState("");
  const [customSets, setCustomSets]   = useState("3");
  const [customReps, setCustomReps]   = useState("10");
  const [customWeight, setCustomWeight] = useState("");
  const [saved, setSaved]             = useState(false);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    const today = getTodayDateString();
    setCurrentDate(today);
    loadDate(today);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDate = async (dateStr: string) => {
    const existing = await getLogForDate(dateStr);
    if (existing) { setLog(existing); setNotes(existing.notes); setPicking(false); }
    else           { setLog(null);     setNotes("");             setPicking(true);  }
  };

  const navigateDate = (offset: number) => {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() + offset);
    const next = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    setCurrentDate(next); setShowAddExercise(false); loadDate(next);
  };

  const pickRoutine  = (r: Routine) => { setLog(buildLogFromRoutine(currentDate, r)); setNotes(""); setPicking(false); };
  const startEmpty   = () => {
    setLog({ id:`workout-${currentDate}`, date:currentDate, dayType:"custom", dayName:"Custom", exercises:[], notes:"" });
    setNotes(""); setPicking(false); setShowAddExercise(true);
  };
  const switchRoutine = () => { setPicking(true); setLog(null); };

  const toggleSet = (exIdx: number, setIdx: number) => {
    if (!log) return;
    setLog({ ...log, exercises: log.exercises.map((ex, ei) =>
      ei !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, completed: !s.completed }) }
    )});
  };

  const updateSetField = (exIdx: number, setIdx: number, field: "reps"|"weight", value: string) => {
    if (!log) return;
    setLog({ ...log, exercises: log.exercises.map((ex, ei) =>
      ei !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, [field]: value }) }
    )});
  };

  const addCustomExercise = () => {
    if (!log || !customName.trim()) return;
    const numSets = parseInt(customSets) || 3;
    const newEx: LoggedExercise = {
      name: customName.trim(), note: "", isCustom: true,
      sets: Array.from({ length: numSets }, (_, i) => ({
        setNumber: i + 1, reps: customReps || "10", weight: customWeight, completed: false,
      })),
    };
    setLog({ ...log, exercises: [...log.exercises, newEx] });
    setCustomName(""); setCustomSets("3"); setCustomReps("10"); setCustomWeight("");
    setShowAddExercise(false);
  };

  const saveWorkout = async () => {
    if (!log || saving) return;
    setSaving(true);
    const updated = { ...log, notes, completedAt: new Date().toISOString() };
    await saveWorkoutLog(updated);
    setLog(updated); setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const activeRoutine = log ? routines.find(r => r.type === log.dayType) : null;
  const dayColor      = activeRoutine?.color || "#f97316";
  const dayGlow       = activeRoutine?.glow  || "rgba(249,115,22,0.15)";
  const totalSets     = log ? log.exercises.reduce((a, ex) => a + ex.sets.length, 0) : 0;
  const completedSets = log ? log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0) : 0;
  const progressPct   = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const { weekday, date: dateLabel } = formatDateDisplay(currentDate);
  const isToday = currentDate === getTodayDateString();

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", fontFamily: "'Outfit', sans-serif", color: "#f0f0fa", paddingBottom: 96 }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${dayGlow} 0%, transparent 65%)`,
        pointerEvents: "none", zIndex: 0, transition: "background 0.6s ease",
      }} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* ── Date navigation ── */}
        <div style={{ paddingTop: 52, paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button onClick={() => navigateDate(-1)} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280", cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#f0f0fa"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#6b7280"; }}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: "#fff", lineHeight: 1 }}>
              {weekday}, {dateLabel}
            </div>
            {isToday && (
              <div style={{ fontSize: 11, color: "#f97316", fontWeight: 600, letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>
                Today
              </div>
            )}
          </div>

          <button onClick={() => navigateDate(1)} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280", cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#f0f0fa"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#6b7280"; }}
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ══════════ ROUTINE PICKER ══════════ */}
        {picking && (
          <div style={{ animation: "fadeUp 0.4s ease-out" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: "#fff", marginBottom: 6 }}>
                PICK A ROUTINE
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>What are you training today?</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {routines.map(routine => (
                <button key={routine.id} onClick={() => pickRoutine(routine)} style={{
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${routine.color}25`,
                  borderRadius: 20, padding: "16px 20px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                  transition: "all 0.2s ease", fontFamily: "inherit",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${routine.color}60`; e.currentTarget.style.boxShadow = `0 0 24px ${routine.glow}`; e.currentTarget.style.background = `${routine.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${routine.color}25`; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: `${routine.color}14`, border: `1px solid ${routine.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <RoutineIcon type={routine.type} size={22} color={routine.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: routine.color, lineHeight: 1 }}>
                      {routine.name}
                    </div>
                    <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                      {routine.muscles.map(m => (
                        <span key={m} style={{ fontSize: 11, color: "#6b7280", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "2px 8px" }}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: routine.color, fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>{routine.exercises.length}</div>
                    <div style={{ color: "#4b4b60", fontSize: 10, letterSpacing: 0.5, marginTop: 2 }}>EXERCISES</div>
                  </div>
                </button>
              ))}
            </div>

            <button onClick={startEmpty} style={{
              width: "100%", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "14px 16px", color: "#6b7280", cursor: "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#f0f0fa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#6b7280"; }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Start empty workout
            </button>
          </div>
        )}

        {/* ══════════ WORKOUT LOGGER ══════════ */}
        {!picking && log && (
          <div style={{ animation: "fadeUp 0.4s ease-out" }}>

            {/* Routine header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `${dayColor}12`, border: `1px solid ${dayColor}35`,
                color: dayColor, padding: "7px 14px", borderRadius: 20,
                fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
              }}>
                <RoutineIcon type={log.dayType} size={15} color={dayColor} />
                {log.dayName}
              </div>
              {totalSets > 0 && (
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  <span style={{ color: completedSets === totalSets ? "#22c55e" : dayColor, fontWeight: 700 }}>{completedSets}</span>
                  <span style={{ color: "#4b4b60" }}>/{totalSets} sets</span>
                </div>
              )}
              {!log.completedAt && (
                <button onClick={switchRoutine} style={{
                  marginLeft: "auto", background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "5px 10px", color: "#6b7280", cursor: "pointer",
                  fontSize: 11, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
                  transition: "all 0.15s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#f0f0fa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <RefreshCw size={11} />
                  Change
                </button>
              )}
            </div>

            {/* Progress bar */}
            {totalSets > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4, transition: "width 0.4s ease",
                    background: completedSets === totalSets
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : `linear-gradient(90deg, ${dayColor}, ${dayColor}bb)`,
                    width: `${progressPct}%`,
                  }} />
                </div>
              </div>
            )}

            {/* Save success */}
            {saved && (
              <div style={{
                marginBottom: 16, padding: "12px 16px",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 14, color: "#22c55e", textAlign: "center", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                animation: "popIn 0.3s ease-out",
              }}>
                <Check size={16} strokeWidth={2.5} />
                Workout saved!
              </div>
            )}

            {/* Exercise list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {log.exercises.map((exercise, exIdx) => {
                const completedInEx = exercise.sets.filter(s => s.completed).length;
                const allDone = completedInEx === exercise.sets.length && exercise.sets.length > 0;

                return (
                  <div key={`${exercise.name}-${exIdx}`} style={{
                    background: allDone ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.025)",
                    border: allDone ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, overflow: "hidden", transition: "border-color 0.3s ease",
                  }}>
                    {/* Exercise header */}
                    <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: allDone ? "#22c55e" : "#f0f0fa", lineHeight: 1.2 }}>
                            {exercise.name}
                          </div>
                          {exercise.isCustom && (
                            <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "1px 6px", fontWeight: 600, letterSpacing: 0.5 }}>CUSTOM</span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 12, fontWeight: 700,
                          color: allDone ? "#22c55e" : dayColor,
                          background: allDone ? "rgba(34,197,94,0.1)" : `${dayColor}12`,
                          border: `1px solid ${allDone ? "rgba(34,197,94,0.3)" : `${dayColor}30`}`,
                          borderRadius: 10, padding: "3px 10px", flexShrink: 0,
                        }}>
                          {completedInEx}/{exercise.sets.length}
                        </div>
                      </div>
                      {exercise.note && (
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5, fontStyle: "italic" }}>{exercise.note}</div>
                      )}
                    </div>

                    {/* Column headers */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "44px 1fr 1fr 1fr", gap: 8,
                      padding: "9px 18px 4px", fontSize: 10, color: "#3a3a52",
                      fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                    }}>
                      <div />
                      <div style={{ textAlign: "center" }}>Set</div>
                      <div style={{ textAlign: "center" }}>Reps</div>
                      <div style={{ textAlign: "center" }}>Kg</div>
                    </div>

                    {/* Set rows */}
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} style={{
                        display: "grid", gridTemplateColumns: "44px 1fr 1fr 1fr", gap: 8,
                        padding: "6px 18px", alignItems: "center",
                        background: set.completed ? "rgba(34,197,94,0.04)" : "transparent",
                        transition: "background 0.2s ease",
                      }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <button onClick={() => toggleSet(exIdx, setIdx)} style={{
                            width: 30, height: 30, borderRadius: 9,
                            background: set.completed ? dayColor : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${set.completed ? dayColor : "rgba(255,255,255,0.1)"}`,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.18s ease", flexShrink: 0,
                            boxShadow: set.completed ? `0 0 12px ${dayColor}50` : "none",
                          }}>
                            {set.completed && <Check size={14} color="#fff" strokeWidth={3} style={{ animation: "checkmark 0.25s ease-out" }} />}
                          </button>
                        </div>
                        <div style={{
                          textAlign: "center", fontSize: 13, fontWeight: 600,
                          color: set.completed ? "#22c55e" : "#6b7280",
                        }}>
                          {set.setNumber}
                        </div>
                        <input
                          type="text" value={set.reps}
                          onChange={e => updateSetField(exIdx, setIdx, "reps", e.target.value)}
                          style={{ ...inputStyle, opacity: set.completed ? 0.55 : 1 }}
                          onFocus={e => { e.currentTarget.style.borderColor = dayColor; e.currentTarget.style.boxShadow = `0 0 0 2px ${dayColor}20`; }}
                          onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                        <input
                          type="text" value={set.weight}
                          onChange={e => updateSetField(exIdx, setIdx, "weight", e.target.value)}
                          style={{ ...inputStyle, opacity: set.completed ? 0.55 : 1 }}
                          onFocus={e => { e.currentTarget.style.borderColor = dayColor; e.currentTarget.style.boxShadow = `0 0 0 2px ${dayColor}20`; }}
                          onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                    ))}
                    <div style={{ height: 10 }} />
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {log.exercises.length === 0 && (
              <div style={{ marginBottom: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 24, textAlign: "center" }}>
                <Dumbbell size={28} color="#3a3a52" style={{ marginBottom: 10 }} />
                <div style={{ color: "#6b7280", fontSize: 14 }}>No exercises yet — add one below.</div>
              </div>
            )}

            {/* Add exercise */}
            {!showAddExercise ? (
              <button onClick={() => setShowAddExercise(true)} style={{
                width: "100%", background: "rgba(255,255,255,0.025)",
                border: `1.5px dashed ${dayColor}40`, borderRadius: 16,
                padding: "14px 16px", color: dayColor, cursor: "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: "inherit", marginBottom: 20,
                transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = dayColor; e.currentTarget.style.background = `${dayColor}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${dayColor}40`; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
              >
                <Plus size={16} strokeWidth={2.5} />
                Add exercise
              </button>
            ) : (
              <div style={{ marginBottom: 20, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 18, animation: "slideDown 0.2s ease-out" }}>
                {/* Quick pick */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Quick pick</label>
                  <button onClick={() => setShowAddExercise(false)} style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <X size={16} />
                  </button>
                </div>

                {EXERCISE_CATALOG.map(group => (
                  <div key={group.group} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: group.color, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>{group.group}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {group.exercises.map(ex => (
                        <button key={ex.name} onClick={() => { setCustomName(ex.name); setCustomSets(String(ex.sets)); setCustomReps(String(ex.reps)); setCustomWeight(ex.weight); }} style={{
                          background: customName === ex.name ? `${group.color}18` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${customName === ex.name ? group.color : "rgba(255,255,255,0.07)"}`,
                          borderRadius: 10, padding: "5px 10px",
                          color: customName === ex.name ? group.color : "#9ca3af",
                          cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 500,
                          transition: "all 0.15s ease",
                        }}>
                          {ex.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <span style={{ fontSize: 10, color: "#3a3a52", fontWeight: 700, letterSpacing: 1 }}>OR TYPE YOUR OWN</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 5, fontWeight: 600, letterSpacing: 0.5 }}>EXERCISE NAME</label>
                    <input type="text" placeholder="e.g. Dumbbell Curl" value={customName} onChange={e => setCustomName(e.target.value)}
                      style={{ ...inputStyle, textAlign: "left", padding: "9px 12px", boxSizing: "border-box" }}
                      onFocus={e => { e.currentTarget.style.borderColor = dayColor; e.currentTarget.style.boxShadow = `0 0 0 2px ${dayColor}20`; }}
                      onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {([["Sets","3",customSets,setCustomSets],["Reps","10",customReps,setCustomReps],["Weight","10kg",customWeight,setCustomWeight]] as [string,string,string,(v:string)=>void][]).map(([lbl,ph,val,setter]) => (
                      <div key={lbl}>
                        <label style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 5, fontWeight: 600, letterSpacing: 0.5 }}>{lbl.toUpperCase()}</label>
                        <input type="text" placeholder={ph} value={val} onChange={e => setter(e.target.value)}
                          style={{ ...inputStyle, padding: "9px 8px" }}
                          onFocus={e => { e.currentTarget.style.borderColor = dayColor; e.currentTarget.style.boxShadow = `0 0 0 2px ${dayColor}20`; }}
                          onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={addCustomExercise} style={{
                      flex: 1, background: dayColor, border: "none", borderRadius: 12,
                      padding: "11px 14px", color: "#fff", cursor: "pointer", fontSize: 13,
                      fontWeight: 700, fontFamily: "inherit",
                    }}>
                      Add exercise
                    </button>
                    <button onClick={() => setShowAddExercise(false)} style={{
                      flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "11px 14px", color: "#6b7280", cursor: "pointer",
                      fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                    }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                <FileText size={12} />
                Session notes
              </label>
              <textarea
                placeholder="How did it feel? Any notes for next time?"
                value={notes} onChange={e => setNotes(e.target.value)}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
                  padding: "12px 14px", color: "#f0f0fa", fontSize: 13,
                  fontFamily: "inherit", outline: "none", minHeight: 80, resize: "none",
                  boxSizing: "border-box", transition: "border-color 0.2s ease",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = dayColor; e.currentTarget.style.boxShadow = `0 0 0 2px ${dayColor}15`; }}
                onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {/* Save button */}
            <button onClick={saveWorkout} disabled={saving} style={{
              width: "100%", background: `linear-gradient(135deg, ${dayColor}, ${dayColor}cc)`,
              border: "none", borderRadius: 16, padding: "15px 16px",
              color: "#fff", cursor: saving ? "wait" : "pointer", fontSize: 15, fontWeight: 700,
              fontFamily: "inherit",
              boxShadow: `0 4px 24px ${dayGlow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
              transition: "opacity 0.2s ease, transform 0.15s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: saving ? 0.7 : 1,
            }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Save size={16} strokeWidth={2.5} />
              {saving ? "Saving…" : "Save workout"}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
