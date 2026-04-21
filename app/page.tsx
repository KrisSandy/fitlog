"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getWorkoutLogs, getTodayDateString, type WorkoutLog } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import {
  Dumbbell, LogOut, Flame, Activity, CalendarDays,
  ChevronRight, Zap, BarChart2,
} from "lucide-react";

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getStreak(logs: WorkoutLog[]): number {
  if (!logs.length) return 0;
  const dateSet = new Set(logs.map(l => l.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const ds = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}-${String(cursor.getDate()).padStart(2,"0")}`;
    if (dateSet.has(ds)) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }
  return streak;
}

function getWeeklyCount(logs: WorkoutLog[]): number {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  return logs.filter(l => new Date(l.date + "T00:00:00") >= weekAgo).length;
}

function getColorForType(t: string) {
  const map: Record<string,string> = { push:"#f97316", pull:"#3b82f6", legs:"#22c55e", full:"#a855f7", custom:"#f59e0b" };
  return map[t] || "#6b7280";
}

export default function Home() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading]         = useState(true);
  const [logs, setLogs]               = useState<WorkoutLog[]>([]);
  const [todayLog, setTodayLog]       = useState<WorkoutLog | null>(null);

  const now     = new Date();
  const today   = getTodayDateString();
  const weekday = WEEKDAYS[now.getDay()];
  const dateStr = `${MONTHS[now.getMonth()]} ${now.getDate()}`;

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
        setDisplayName(profile?.display_name || user.email?.split("@")[0] || "Athlete");
      }
      const allLogs = await getWorkoutLogs();
      const sorted  = allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLogs(sorted);
      setTodayLog(sorted.find(l => l.date === today) || null);
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const streak      = getStreak(logs);
  const weeklyCount = getWeeklyCount(logs);
  const totalCount  = logs.length;

  const todayColor = todayLog ? getColorForType(todayLog.dayType) : "#f97316";
  const todayGlow  = todayLog ? `${todayColor}35` : "rgba(249,115,22,0.22)";
  const totalCompleted = todayLog
    ? todayLog.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)
    : 0;
  const totalSets = todayLog
    ? todayLog.exercises.reduce((a, ex) => a + ex.sets.length, 0)
    : 0;

  return (
    <main style={{
      minHeight: "100vh", background: "#08080f",
      fontFamily: "'Outfit', sans-serif", padding: "0 0 96px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{
        position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "10%", right: "-15%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* ── Top bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 56, paddingBottom: 28,
          animation: "fadeUp 0.5s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(168,85,247,0.15))",
              border: "1px solid rgba(249,115,22,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(249,115,22,0.12)",
            }}>
              <Dumbbell size={20} color="#f97316" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>FITLOG</div>
              <div style={{ fontSize: 11, color: "#4b4b60", letterSpacing: 0.5, marginTop: 1 }}>
                {weekday.toUpperCase()}, {dateStr.toUpperCase()}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "8px 12px", color: "#4b4b60", cursor: "pointer",
            fontSize: 12, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#e8e8f0"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#4b4b60"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <LogOut size={13} />
            Out
          </button>
        </div>

        {/* ── Greeting ── */}
        {!loading && (
          <div style={{ marginBottom: 28, animation: "fadeUp 0.55s ease-out" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#f0f0fa", lineHeight: 1.2, marginBottom: 4 }}>
              {displayName ? `Hey, ${displayName} 👋` : "Welcome back 👋"}
            </div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              {streak > 0 ? `${streak}-day streak — keep it going.` : "Ready to start your session?"}
            </div>
          </div>
        )}
        {loading && (
          <div style={{ marginBottom: 28, height: 60, background: "rgba(255,255,255,0.03)", borderRadius: 12, animation: "shimmer 1.5s infinite" }} />
        )}

        {/* ── Stats row ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24,
          animation: "fadeUp 0.6s ease-out",
        }}>
          {[
            { icon: Flame, label: "Streak", value: streak > 0 ? `${streak}d` : "—", color: "#f97316", glow: "rgba(249,115,22,0.12)" },
            { icon: BarChart2, label: "This week", value: weeklyCount, color: "#3b82f6", glow: "rgba(59,130,246,0.12)" },
            { icon: Activity, label: "Total", value: totalCount, color: "#a855f7", glow: "rgba(168,85,247,0.12)" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 18, padding: "14px 12px",
                backdropFilter: "blur(12px)",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: stat.glow,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} color={stat.color} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0fa", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#4b4b60", fontWeight: 500, letterSpacing: 0.3 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Today card ── */}
        <div style={{ marginBottom: 16, animation: "fadeUp 0.65s ease-out" }}>
          <div style={{ fontSize: 11, color: "#4b4b60", fontWeight: 600, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Today</div>

          {todayLog ? (
            // Already logged today
            <Link href="/log" style={{ textDecoration: "none" }}>
              <div style={{
                background: `linear-gradient(135deg, rgba(20,20,32,0.9), rgba(16,16,28,0.9))`,
                border: `1px solid ${todayColor}30`,
                borderRadius: 22, padding: "20px 22px",
                backdropFilter: "blur(16px)",
                boxShadow: `0 0 40px ${todayGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", transition: "all 0.2s ease",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: todayColor,
                      boxShadow: `0 0 8px ${todayColor}`,
                    }} />
                    <span style={{ fontSize: 11, color: todayColor, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                      {todayLog.dayName} · Logged
                    </span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f0f0fa", marginBottom: 8 }}>
                    {todayLog.exercises.length} exercises
                  </div>
                  {totalSets > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{totalCompleted}/{totalSets} sets</span>
                        <span style={{ fontSize: 12, color: totalCompleted === totalSets ? "#22c55e" : todayColor, fontWeight: 600 }}>
                          {totalSets > 0 ? Math.round((totalCompleted / totalSets) * 100) : 0}%
                        </span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 4,
                          background: totalCompleted === totalSets
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : `linear-gradient(90deg, ${todayColor}, ${todayColor}cc)`,
                          width: `${totalSets > 0 ? (totalCompleted / totalSets) * 100 : 0}%`,
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                    </div>
                  )}
                </div>
                <ChevronRight size={20} color={todayColor} style={{ marginLeft: 16, flexShrink: 0 }} />
              </div>
            </Link>
          ) : (
            // No workout yet today
            <Link href="/log" style={{ textDecoration: "none" }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.06))",
                border: "1px solid rgba(249,115,22,0.2)",
                borderRadius: 22, padding: "22px 22px",
                backdropFilter: "blur(16px)",
                boxShadow: "0 0 40px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(249,115,22,0.18), inset 0 1px 0 rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.05)"; }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Zap size={14} color="#f97316" strokeWidth={2.5} />
                    <span style={{ fontSize: 11, color: "#f97316", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                      Not logged yet
                    </span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f0f0fa" }}>
                    Start today's session
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    Pick a routine and get moving
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.35)", flexShrink: 0, marginLeft: 16,
                }}>
                  <ChevronRight size={22} color="#fff" strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* ── Quick access ── */}
        <div style={{ animation: "fadeUp 0.7s ease-out" }}>
          <div style={{ fontSize: 11, color: "#4b4b60", fontWeight: 600, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Quick access</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Link href="/routine" style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "18px 16px",
                backdropFilter: "blur(12px)",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.055)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(249,115,22,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
                }}>
                  <Dumbbell size={20} color="#f97316" strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0fa", marginBottom: 3 }}>Routines</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>4 programs</div>
              </div>
            </Link>

            <Link href="/history" style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "18px 16px",
                backdropFilter: "blur(12px)",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.055)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(168,85,247,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
                }}>
                  <CalendarDays size={20} color="#a855f7" strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0fa", marginBottom: 3 }}>History</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{totalCount} sessions</div>
              </div>
            </Link>
          </div>
        </div>

      </div>

      <BottomNav />
    </main>
  );
}
