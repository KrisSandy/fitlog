"use client";
import { useState, useEffect } from "react";
import { routines, type Routine } from "@/lib/routineData";
import {
  saveWorkoutLog, getLogForDate, getTodayDateString, parseRepsToSets,
  type LoggedExercise, type WorkoutLog,
} from "@/lib/storage";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  const weekday = WEEKDAYS[date.getDay()];
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  return `${weekday.toUpperCase()}, ${month} ${day}`;
}

function buildLogFromRoutine(dateStr: string, routine: Routine): WorkoutLog {
  return {
    id: `workout-${dateStr}`,
    date: dateStr,
    dayType: routine.type,
    dayName: routine.name,
    exercises: routine.exercises.map(ex => {
      const repsPerSet = parseRepsToSets(ex.reps, ex.sets);
      return {
        name: ex.name,
        note: ex.note,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          reps: repsPerSet[i] || repsPerSet[repsPerSet.length - 1] || "10",
          weight: ex.weight,
          completed: false,
        })),
      };
    }),
    notes: "",
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#13131e",
  border: "1px solid #2a2a3a",
  borderRadius: 8,
  padding: "6px 8px",
  color: "#e8e8f0",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  textAlign: "center",
};

export default function WorkoutLogger() {
  const [currentDate, setCurrentDate] = useState("");
  const [log, setLog] = useState<WorkoutLog | null>(null);
  const [picking, setPicking] = useState(false); // true = show routine picker
  const [notes, setNotes] = useState("");
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customSets, setCustomSets] = useState("3");
  const [customReps, setCustomReps] = useState("10");
  const [customWeight, setCustomWeight] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const today = getTodayDateString();
    setCurrentDate(today);
    loadDate(today);
  }, []);

  const loadDate = (dateStr: string) => {
    const existing = getLogForDate(dateStr);
    if (existing) {
      setLog(existing);
      setNotes(existing.notes);
      setPicking(false);
    } else {
      setLog(null);
      setNotes("");
      setPicking(true);
    }
  };

  const navigateDate = (offset: number) => {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() + offset);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setCurrentDate(next);
    setShowAddExercise(false);
    loadDate(next);
  };

  const pickRoutine = (routine: Routine) => {
    const newLog = buildLogFromRoutine(currentDate, routine);
    setLog(newLog);
    setNotes("");
    setPicking(false);
  };

  const startEmpty = () => {
    const newLog: WorkoutLog = {
      id: `workout-${currentDate}`,
      date: currentDate,
      dayType: "custom",
      dayName: "Custom",
      exercises: [],
      notes: "",
    };
    setLog(newLog);
    setNotes("");
    setPicking(false);
    setShowAddExercise(true);
  };

  const switchRoutine = () => {
    setPicking(true);
    setLog(null);
  };

  /* ---- mutations ---- */

  const toggleSet = (exIdx: number, setIdx: number) => {
    if (!log) return;
    setLog({ ...log, exercises: log.exercises.map((ex, ei) =>
      ei === exIdx ? { ...ex, sets: ex.sets.map((s, si) =>
        si === setIdx ? { ...s, completed: !s.completed } : s
      )} : ex
    )});
  };

  const updateSetField = (exIdx: number, setIdx: number, field: "reps" | "weight", value: string) => {
    if (!log) return;
    setLog({ ...log, exercises: log.exercises.map((ex, ei) =>
      ei === exIdx ? { ...ex, sets: ex.sets.map((s, si) =>
        si === setIdx ? { ...s, [field]: value } : s
      )} : ex
    )});
  };

  const addCustomExercise = () => {
    if (!log || !customName.trim()) return;
    const numSets = parseInt(customSets) || 3;
    const newEx: LoggedExercise = {
      name: customName.trim(),
      note: "",
      isCustom: true,
      sets: Array.from({ length: numSets }, (_, i) => ({
        setNumber: i + 1,
        reps: customReps || "10",
        weight: customWeight,
        completed: false,
      })),
    };
    setLog({ ...log, exercises: [...log.exercises, newEx] });
    setCustomName(""); setCustomSets("3"); setCustomReps("10"); setCustomWeight("");
    setShowAddExercise(false);
  };

  const saveWorkout = () => {
    if (!log) return;
    const updated = { ...log, notes, completedAt: new Date().toISOString() };
    saveWorkoutLog(updated);
    setLog(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Resolve colors for current log
  const activeRoutine = log ? routines.find(r => r.type === log.dayType) : null;
  const dayColor = activeRoutine?.color || "#6b7280";
  const dayGlow = activeRoutine?.glow || "rgba(107,114,128,0.1)";

  const totalSets = log ? log.exercises.reduce((a, ex) => a + ex.sets.length, 0) : 0;
  const completedSets = log ? log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Outfit', sans-serif", color: "#e8e8f0", padding: "24px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Date navigation */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button onClick={() => navigateDate(-1)} style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", cursor: "pointer", fontSize: 16 }}>←</button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: "#fff", lineHeight: 1 }}>{formatDateDisplay(currentDate)}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{currentDate}</div>
          </div>
          <button onClick={() => navigateDate(1)} style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", cursor: "pointer", fontSize: 16 }}>→</button>
        </div>

        {/* =================== ROUTINE PICKER =================== */}
        {picking && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: "#fff", marginBottom: 6 }}>PICK A ROUTINE</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>What are you training today?</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {routines.map(routine => (
                <button
                  key={routine.id}
                  onClick={() => pickRoutine(routine)}
                  style={{
                    background: "#0f0f18",
                    border: `1px solid ${routine.color}30`,
                    borderRadius: 16,
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = routine.color;
                    e.currentTarget.style.boxShadow = `0 0 20px ${routine.glow}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${routine.color}30`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${routine.color}15`,
                    border: `1px solid ${routine.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {routine.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: routine.color, lineHeight: 1 }}>
                      {routine.name}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {routine.muscles.map(m => (
                        <span key={m} style={{ fontSize: 11, color: "#6b7280", background: "#1a1a28", borderRadius: 8, padding: "2px 8px" }}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: routine.color, fontSize: 20, fontFamily: "'Bebas Neue', sans-serif" }}>{routine.exercises.length}</div>
                    <div style={{ color: "#4b4b60", fontSize: 10, letterSpacing: 0.5 }}>EXERCISES</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Empty / custom workout */}
            <button
              onClick={startEmpty}
              style={{
                width: "100%", background: "#0f0f18", border: "1px dashed #2a2a3a", borderRadius: 14,
                padding: "14px 16px", color: "#6b7280", cursor: "pointer", fontSize: 14, fontWeight: 600,
                fontFamily: "inherit", marginBottom: 24, transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.color = "#e8e8f0"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.color = "#6b7280"; }}
            >
              + Start Empty Workout
            </button>

            <div style={{ textAlign: "center" }}>
              <a href="/" style={{ color: "#6b7280", fontSize: 13, textDecoration: "none" }}>← Back to home</a>
            </div>
          </>
        )}

        {/* =================== WORKOUT LOGGER =================== */}
        {!picking && log && (
          <>
            {/* Routine badge + progress + change button */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `${dayColor}15`,
                border: `1px solid ${dayColor}40`,
                color: dayColor,
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}>
                {activeRoutine?.icon || "🏋️"} {log.dayName}
              </div>
              {totalSets > 0 && (
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  <span style={{ color: completedSets === totalSets ? "#22c55e" : dayColor, fontWeight: 600 }}>{completedSets}</span>/{totalSets} sets
                </div>
              )}
              {!log.completedAt && (
                <button
                  onClick={switchRoutine}
                  style={{
                    background: "transparent", border: "1px solid #2a2a3a", borderRadius: 8,
                    padding: "4px 10px", color: "#6b7280", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.color = "#e8e8f0"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.color = "#6b7280"; }}
                >
                  Change
                </button>
              )}
            </div>

            {/* Success message */}
            {saved && (
              <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", borderRadius: 12, color: "#22c55e", textAlign: "center", fontSize: 14, fontWeight: 600 }}>
                ✓ Workout saved
              </div>
            )}

            {/* Exercise list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {log.exercises.map((exercise, exIdx) => {
                const completedInExercise = exercise.sets.filter(s => s.completed).length;
                const allDone = completedInExercise === exercise.sets.length;

                return (
                  <div key={`${exercise.name}-${exIdx}`} style={{
                    background: "#0f0f18",
                    border: allDone ? "1px solid #22c55e40" : "1px solid #1e1e2e",
                    borderRadius: 16,
                    overflow: "hidden",
                    transition: "border-color 0.2s ease",
                  }}>
                    {/* Exercise header */}
                    <div style={{
                      padding: "14px 16px 10px",
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      borderBottom: "1px solid #1a1a28",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: allDone ? "#22c55e" : "#e8e8f0" }}>
                            {exercise.name}
                          </div>
                          {exercise.isCustom && (
                            <span style={{ fontSize: 10, color: "#f59e0b", background: "#f59e0b15", border: "1px solid #f59e0b40", borderRadius: 8, padding: "1px 6px", fontWeight: 600 }}>CUSTOM</span>
                          )}
                        </div>
                        {exercise.note && (
                          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontStyle: "italic" }}>{exercise.note}</div>
                        )}
                      </div>
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: allDone ? "#22c55e" : dayColor,
                        background: allDone ? "rgba(34,197,94,0.1)" : `${dayColor}15`,
                        border: `1px solid ${allDone ? "#22c55e40" : `${dayColor}40`}`,
                        borderRadius: 12, padding: "3px 10px", whiteSpace: "nowrap",
                      }}>
                        {completedInExercise}/{exercise.sets.length}
                      </div>
                    </div>

                    {/* Column headers */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "40px 1fr 1fr 1fr", gap: 8,
                      padding: "8px 16px 4px", fontSize: 11, color: "#4b4b60", fontWeight: 600, letterSpacing: 0.5,
                    }}>
                      <div></div>
                      <div style={{ textAlign: "center" }}>SET</div>
                      <div style={{ textAlign: "center" }}>REPS</div>
                      <div style={{ textAlign: "center" }}>KG</div>
                    </div>

                    {/* Set rows */}
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} style={{
                        display: "grid", gridTemplateColumns: "40px 1fr 1fr 1fr", gap: 8,
                        padding: "6px 16px",
                        alignItems: "center",
                        background: set.completed ? "rgba(34,197,94,0.04)" : "transparent",
                        transition: "background 0.15s ease",
                      }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <button
                            onClick={() => toggleSet(exIdx, setIdx)}
                            style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: set.completed ? dayColor : "#1a1a28",
                              border: `2px solid ${set.completed ? dayColor : "#2a2a3a"}`,
                              cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: set.completed ? "#fff" : "transparent",
                              fontSize: 14, fontWeight: 700,
                              transition: "all 0.15s ease",
                              flexShrink: 0,
                            }}
                          >
                            {set.completed ? "✓" : ""}
                          </button>
                        </div>
                        <div style={{
                          textAlign: "center", fontSize: 14, fontWeight: 600,
                          color: set.completed ? "#22c55e" : "#9ca3af",
                          opacity: set.completed ? 0.7 : 1,
                        }}>
                          Set {set.setNumber}
                        </div>
                        <input type="text" value={set.reps}
                          onChange={e => updateSetField(exIdx, setIdx, "reps", e.target.value)}
                          style={{ ...inputStyle, opacity: set.completed ? 0.6 : 1, borderColor: set.completed ? "#22c55e30" : "#2a2a3a" }}
                        />
                        <input type="text" value={set.weight}
                          onChange={e => updateSetField(exIdx, setIdx, "weight", e.target.value)}
                          style={{ ...inputStyle, opacity: set.completed ? 0.6 : 1, borderColor: set.completed ? "#22c55e30" : "#2a2a3a" }}
                        />
                      </div>
                    ))}
                    <div style={{ height: 8 }} />
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {log.exercises.length === 0 && (
              <div style={{ marginBottom: 24, background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 16, padding: 20, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
                No exercises yet. Add one below to get started.
              </div>
            )}

            {/* Add exercise */}
            {!showAddExercise ? (
              <button onClick={() => setShowAddExercise(true)} style={{
                width: "100%", background: "#0f0f18", border: "1px dashed #2a2a3a", borderRadius: 14,
                padding: "14px 16px", color: "#6b7280", cursor: "pointer", fontSize: 14, fontWeight: 600,
                fontFamily: "inherit", marginBottom: 24, transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = dayColor; e.currentTarget.style.color = dayColor; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.color = "#6b7280"; }}
              >
                + Add Exercise
              </button>
            ) : (
              <div style={{ marginBottom: 24, background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Exercise Name</label>
                    <input type="text" placeholder="e.g., Dumbbell Curl" value={customName} onChange={e => setCustomName(e.target.value)}
                      style={{ ...inputStyle, textAlign: "left", padding: "8px 10px", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Sets</label>
                      <input type="text" placeholder="3" value={customSets} onChange={e => setCustomSets(e.target.value)}
                        style={{ ...inputStyle, padding: "8px 10px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Reps</label>
                      <input type="text" placeholder="10" value={customReps} onChange={e => setCustomReps(e.target.value)}
                        style={{ ...inputStyle, padding: "8px 10px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Weight</label>
                      <input type="text" placeholder="10kg" value={customWeight} onChange={e => setCustomWeight(e.target.value)}
                        style={{ ...inputStyle, padding: "8px 10px" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={addCustomExercise} style={{ flex: 1, background: dayColor, border: "none", borderRadius: 8, padding: "10px 12px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Add</button>
                    <button onClick={() => setShowAddExercise(false)} style={{ flex: 1, background: "#13131e", border: "1px solid #2a2a3a", borderRadius: 8, padding: "10px 12px", color: "#6b7280", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Session Notes</label>
              <textarea placeholder="How did it feel? Any notes for next time?"
                value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: "100%", background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 12, padding: "12px 14px", color: "#e8e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", minHeight: 80, resize: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Save */}
            <button onClick={saveWorkout} style={{
              width: "100%", background: dayColor, border: "none", borderRadius: 14,
              padding: "14px 16px", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600,
              fontFamily: "inherit", marginBottom: 16, boxShadow: `0 0 20px ${dayGlow}`, transition: "opacity 0.2s ease",
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Save Workout
            </button>

            <div style={{ textAlign: "center" }}>
              <a href="/" style={{ color: "#6b7280", fontSize: 13, textDecoration: "none" }}>← Back to home</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
