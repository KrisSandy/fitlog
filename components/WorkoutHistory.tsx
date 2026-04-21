"use client";
import { useState, useEffect } from "react";
import { getWorkoutLogs, type WorkoutLog } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import {
  ChevronDown, CheckCircle2, Circle, StickyNote, Clock,
  Activity, ArrowUp, ArrowDown, Zap, Dumbbell,
  TrendingUp, CalendarDays, Flame,
} from "lucide-react";

const MONTH_NAMES   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAY_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function getColorForDayType(t: string): string {
  const map: Record<string,string> = { push:"#f97316", pull:"#3b82f6", legs:"#22c55e", full:"#a855f7", custom:"#f59e0b" };
  return map[t] || "#6b7280";
}
function getLabelForDayType(t: string): string {
  const map: Record<string,string> = { push:"PUSH", pull:"PULL", legs:"LEGS", full:"FULL", custom:"CUSTOM" };
  return map[t] || t.toUpperCase();
}

function RoutineIcon({ type, size = 16, color }: { type: string; size?: number; color: string }) {
  const props = { size, color, strokeWidth: 2.5 };
  if (type === "push") return <ArrowUp    {...props} />;
  if (type === "pull") return <ArrowDown  {...props} />;
  if (type === "legs") return <Activity   {...props} />;
  if (type === "full") return <Zap        {...props} />;
  return <Dumbbell {...props} />;
}

function getStreak(logs: WorkoutLog[]): number {
  if (!logs.length) return 0;
  const dateSet = new Set(logs.map(l => l.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const ds = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}-${String(cursor.getDate()).padStart(2,"0")}`;
    if (dateSet.has(ds)) { streak++; cursor.setDate(cursor.getDate()-1); }
    else break;
  }
  return streak;
}

export default function WorkoutHistory() {
  const [logs, setLogs]               = useState<WorkoutLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Record<string,boolean>>({});

  useEffect(() => {
    const load = async () => {
      const all = await getWorkoutLogs();
      setLogs(all.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    load();
  }, []);

  const toggleExpand = (id: string) => setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));

  const today         = new Date();
  const currentYear   = today.getFullYear();
  const currentMonth  = today.getMonth();
  const daysInMonth   = new Date(currentYear, currentMonth+1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calDays: (number|null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  const logsByDate: Record<string,WorkoutLog> = {};
  logs.forEach(l => { logsByDate[l.date] = l; });

  const streak = getStreak(logs);
  const weeklyCount = (() => {
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate()-7);
    return logs.filter(l => new Date(l.date+"T00:00:00") >= weekAgo).length;
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", fontFamily: "'Outfit', sans-serif", color: "#f0f0fa", paddingBottom: 96 }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "-15%", right: "-10%",
        width: 450, height: 450, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ paddingTop: 52, paddingBottom: 24, animation: "fadeUp 0.5s ease-out" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>WORKOUT</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, background: "linear-gradient(135deg, #f97316, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>HISTORY</span>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24,
          animation: "fadeUp 0.55s ease-out",
        }}>
          {[
            { icon: TrendingUp,  label: "Total",      value: logs.length,  color: "#f97316", glow: "rgba(249,115,22,0.1)"  },
            { icon: CalendarDays, label: "This week", value: weeklyCount,  color: "#3b82f6", glow: "rgba(59,130,246,0.1)"  },
            { icon: Flame,       label: "Streak",     value: streak > 0 ? `${streak}d` : "—", color: "#22c55e", glow: "rgba(34,197,94,0.1)" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 18, padding: "14px 12px", backdropFilter: "blur(12px)",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: stat.glow, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={stat.color} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0fa", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#4b4b60", fontWeight: 500, letterSpacing: 0.3 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Calendar ── */}
        <div style={{
          marginBottom: 28, background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "18px 18px 16px",
          backdropFilter: "blur(16px)", boxShadow: "0 4px 32px rgba(0,0,0,0.25)",
          animation: "fadeUp 0.6s ease-out",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: "#fff", marginBottom: 18,
          }}>
            <CalendarDays size={17} color="#f97316" strokeWidth={2.5} />
            {MONTH_NAMES[currentMonth].toUpperCase()} {currentYear}
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
            {WEEKDAY_SHORT.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#3a3a52", fontWeight: 700, letterSpacing: 0.5, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
            {calDays.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} style={{ aspectRatio: "1", borderRadius: 10 }} />;
              const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const log     = logsByDate[dateStr];
              const color   = log ? getColorForDayType(log.dayType) : "transparent";
              const isToday = day === today.getDate();
              return (
                <div key={`d-${day}`} style={{
                  aspectRatio: "1", borderRadius: 11,
                  background: log ? `${color}16` : isToday ? "rgba(255,255,255,0.05)" : "#111118",
                  border: isToday
                    ? `2px solid ${log ? color : "rgba(249,115,22,0.4)"}`
                    : log ? `1px solid ${color}28` : "1px solid transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600,
                  color: log ? color : isToday ? "#6b7280" : "#2a2a3a",
                  position: "relative", transition: "all 0.2s ease",
                  boxShadow: log ? `0 2px 10px ${color}18` : "none",
                }}>
                  <span>{day}</span>
                  {log && (
                    <div style={{
                      position: "absolute", bottom: 3,
                      width: 4, height: 4, borderRadius: "50%",
                      background: color, boxShadow: `0 0 6px ${color}`,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Log list ── */}
        {logs.length === 0 ? (
          <div style={{
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 24, padding: 44, textAlign: "center",
            backdropFilter: "blur(12px)", animation: "fadeUp 0.7s ease-out",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 20,
              background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
            }}>
              <Dumbbell size={26} color="#f97316" strokeWidth={2} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>NO LOGS YET</div>
            <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
              Start logging your workouts to track your progress here.
            </div>
            <a href="/log" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14,
              padding: "11px 22px", borderRadius: 14,
              boxShadow: "0 4px 20px rgba(249,115,22,0.3)",
            }}>
              Log your first workout
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {logs.map((log, logIdx) => {
              const isExpanded = expandedLogs[log.id];
              const color      = getColorForDayType(log.dayType);
              const totalSets  = log.exercises.reduce((a, ex) => a + ex.sets.length, 0);
              const donesets   = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
              const dateObj    = new Date(log.date + "T00:00:00");
              const dateFmt    = `${MONTH_NAMES[dateObj.getMonth()].toUpperCase()} ${dateObj.getDate()}`;
              const weekday    = ["SUN","MON","TUE","WED","THU","FRI","SAT"][dateObj.getDay()];
              const pct        = totalSets > 0 ? Math.round((donesets/totalSets)*100) : 0;

              return (
                <div key={log.id} style={{
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 22, overflow: "hidden", backdropFilter: "blur(12px)",
                  transition: "all 0.2s ease",
                  animation: `fadeUp ${0.4 + logIdx * 0.04}s ease-out`,
                }}>
                  {/* Collapsed row */}
                  <button onClick={() => toggleExpand(log.id)} style={{
                    width: "100%", padding: "14px 18px", background: "transparent", border: "none",
                    color: "#f0f0fa", cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 12, textAlign: "left", transition: "background 0.15s ease", fontFamily: "inherit",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Day icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `${color}12`, border: `1px solid ${color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <RoutineIcon type={log.dayType} size={18} color={color} />
                    </div>

                    {/* Date + progress */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0fa" }}>{dateFmt}</span>
                        <span style={{ fontSize: 11, color: "#4b4b60", fontWeight: 600 }}>{weekday}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", maxWidth: 90 }}>
                          <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, transition: "width 0.3s ease",
                            background: pct === 100 ? "#22c55e" : color,
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{donesets}/{totalSets}</span>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div style={{
                      background: `${color}10`, border: `1px solid ${color}28`, color,
                      padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                      letterSpacing: 0.5, flexShrink: 0,
                    }}>
                      {getLabelForDayType(log.dayType)}
                    </div>

                    <ChevronDown size={15} color="#3a3a52" style={{ transition: "transform 0.25s ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "16px 18px", background: "rgba(0,0,0,0.2)", animation: "slideDown 0.2s ease-out" }}>
                      {log.exercises.map((ex, exIdx) => {
                        const exDone = ex.sets.filter(s => s.completed).length;
                        const exColor = exDone === ex.sets.length ? "#22c55e" : color;
                        return (
                          <div key={exIdx} style={{ marginBottom: exIdx < log.exercises.length-1 ? 18 : 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0fa" }}>{ex.name}</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: exColor }}>
                                {exDone}/{ex.sets.length}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {ex.sets.map((set, sIdx) => (
                                <div key={sIdx} style={{
                                  display: "grid", gridTemplateColumns: "22px 48px 1fr 1fr", gap: 8,
                                  alignItems: "center", fontSize: 12,
                                  padding: "6px 10px", borderRadius: 10,
                                  background: set.completed ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.025)",
                                  opacity: set.completed ? 0.9 : 0.45,
                                }}>
                                  {set.completed
                                    ? <CheckCircle2 size={14} color={color} strokeWidth={2.5} />
                                    : <Circle       size={14} color="#2a2a3a" strokeWidth={2} />
                                  }
                                  <div style={{ color: "#6b7280", fontWeight: 600 }}>Set {set.setNumber}</div>
                                  <div style={{ color: "#9ca3af" }}>{set.reps} reps</div>
                                  <div style={{ color: "#9ca3af" }}>{set.weight || "—"}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {log.notes && (
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#3a3a52", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                            <StickyNote size={12} />
                            Notes
                          </div>
                          <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, fontStyle: "italic" }}>{log.notes}</div>
                        </div>
                      )}

                      {log.completedAt && (
                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, fontSize: 11, color: "#2a2a3a" }}>
                          <Clock size={11} />
                          {new Date(log.completedAt).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
