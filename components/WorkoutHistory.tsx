"use client";
import { useState, useEffect } from "react";
import { getWorkoutLogs, type WorkoutLog } from "@/lib/storage";

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getColorForDayType(dayType: string): string {
  const map: Record<string, string> = { push: "#f97316", pull: "#3b82f6", legs: "#22c55e", full: "#a855f7", custom: "#f59e0b" };
  return map[dayType] || "#6b7280";
}

function getDayTypeLabel(dayType: string): string {
  const map: Record<string, string> = { push: "PUSH", pull: "PULL", legs: "LEGS", full: "FULL", custom: "CUSTOM" };
  return map[dayType] || dayType.toUpperCase();
}

export default function WorkoutHistory() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const all = await getWorkoutLogs();
      setLogs(all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    load();
  }, []);

  const toggleExpand = (id: string) => setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const logsByDate: Record<string, WorkoutLog> = {};
  logs.forEach(log => { logsByDate[log.date] = log; });

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Outfit', sans-serif", color: "#e8e8f0", padding: "24px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>WORKOUT</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, background: "linear-gradient(135deg, #f97316, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>HISTORY</span>
          </div>
          <div style={{ color: "#6b7280", fontSize: 13, letterSpacing: 1 }}>TOTAL WORKOUTS: {logs.length}</div>
        </div>

        {/* Calendar */}
        <div style={{ marginBottom: 32, background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 20, padding: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, color: "#fff", marginBottom: 16, textAlign: "center" }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
            {WEEKDAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#6b7280", fontWeight: 600, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} style={{ aspectRatio: "1", borderRadius: 8 }} />;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const log = logsByDate[dateStr];
              const color = log ? getColorForDayType(log.dayType) : "transparent";
              return (
                <div key={`d-${day}`} style={{
                  aspectRatio: "1", borderRadius: 8,
                  background: log ? `${color}20` : "#1a1a28",
                  border: log ? `1px solid ${color}40` : "1px solid #1a1a28",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: log ? color : "#4b4b60", position: "relative",
                }}>
                  {day}
                  {log && <div style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: "50%", background: color }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Logs list */}
        {logs.length === 0 ? (
          <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 20, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>NO LOGS YET</div>
            <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Start logging your workouts to see your history here.</div>
            <a href="/log" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Log your first workout →</a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {logs.map(log => {
              const isExpanded = expandedLogs[log.id];
              const color = getColorForDayType(log.dayType);
              const totalSets = log.exercises.reduce((a, ex) => a + ex.sets.length, 0);
              const completedSets = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
              const dateObj = new Date(log.date + "T00:00:00");
              const dateDisplay = `${dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${dateObj.getDate()}`;

              return (
                <div key={log.id} style={{ background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 16, overflow: "hidden" }}>
                  <button onClick={() => toggleExpand(log.id)} style={{
                    width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: "#e8e8f0",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", transition: "background 0.2s ease",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#13131e")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: 18 }}>📅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{dateDisplay}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{completedSets}/{totalSets} sets completed</div>
                    </div>
                    <div style={{ display: "inline-block", background: `${color}15`, border: `1px solid ${color}40`, color, padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600, marginRight: 8 }}>
                      {getDayTypeLabel(log.dayType)}
                    </div>
                    <div style={{ fontSize: 16, color: "#6b7280", transition: "transform 0.2s ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
                  </button>

                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #1a1a28", padding: "12px 16px", background: "#0a0a12" }}>
                      {log.exercises.map((ex, exIdx) => {
                        const exCompleted = ex.sets.filter(s => s.completed).length;
                        return (
                          <div key={exIdx} style={{ marginBottom: exIdx < log.exercises.length - 1 ? 16 : 0 }}>
                            {/* Exercise name */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0" }}>{ex.name}</div>
                              <div style={{ fontSize: 11, color: exCompleted === ex.sets.length ? "#22c55e" : "#6b7280", fontWeight: 600 }}>
                                {exCompleted}/{ex.sets.length}
                              </div>
                            </div>
                            {/* Set rows */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {ex.sets.map((set, sIdx) => (
                                <div key={sIdx} style={{
                                  display: "grid", gridTemplateColumns: "20px 50px 1fr 1fr", gap: 8,
                                  alignItems: "center", fontSize: 12, padding: "4px 8px", background: "#13131e", borderRadius: 6,
                                  opacity: set.completed ? 0.7 : 0.5,
                                }}>
                                  <div style={{
                                    width: 14, height: 14, borderRadius: 4,
                                    background: set.completed ? color : "#1a1a28",
                                    border: `1px solid ${set.completed ? color : "#2a2a3a"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: set.completed ? "#fff" : "transparent", fontSize: 10, fontWeight: 700,
                                  }}>
                                    {set.completed ? "✓" : ""}
                                  </div>
                                  <div style={{ color: "#6b7280", fontWeight: 500 }}>Set {set.setNumber}</div>
                                  <div style={{ color: "#9ca3af" }}>{set.reps} reps</div>
                                  <div style={{ color: "#9ca3af" }}>{set.weight || "—"}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {log.notes && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a1a28" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Notes</div>
                          <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5, fontStyle: "italic" }}>{log.notes}</div>
                        </div>
                      )}

                      {log.completedAt && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "#4b4b60", textAlign: "right" }}>
                          Logged at {new Date(log.completedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/" style={{ color: "#6b7280", fontSize: 13, textDecoration: "none" }}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}
