"use client";
import { useState } from "react";
import { routines } from "@/lib/routineData";
import BottomNav from "@/components/BottomNav";
import {
  ArrowUp, ArrowDown, Activity, Zap, Dumbbell,
  ChevronRight, Target, Check,
} from "lucide-react";

const targets = [
  { exercise: "Shoulder Press", from: "6kg", to: "8kg",             status: "ready"    },
  { exercise: "Hammer Curl",    from: "6kg", to: "8kg",             status: "ready"    },
  { exercise: "Cable Row",      from: "45kg", to: "50kg",           status: "building" },
  { exercise: "Bench Press",    from: "20kg", to: "25kg consistent", status: "reset"   },
];

const STATUS_CONFIG = {
  ready:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)",  label: "Ready"    },
  building: { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", label: "Building" },
  reset:    { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  label: "Reset"    },
};

function RoutineIcon({ type, size = 20, color }: { type: string; size?: number; color: string }) {
  const props = { size, color, strokeWidth: 2.5 };
  if (type === "push") return <ArrowUp    {...props} />;
  if (type === "pull") return <ArrowDown  {...props} />;
  if (type === "legs") return <Activity   {...props} />;
  if (type === "full") return <Zap        {...props} />;
  return <Dumbbell {...props} />;
}

function SetPips({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, opacity: 0.75 }} />
      ))}
    </div>
  );
}

export default function WorkoutRoutine() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? routines.find(r => r.id === selectedId) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", fontFamily: "'Outfit', sans-serif", color: "#f0f0fa", paddingBottom: 96 }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "-15%", right: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: selected
          ? `radial-gradient(circle, ${selected.glow.replace("0.2","0.08")} 0%, transparent 70%)`
          : "radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, transition: "background 0.6s ease",
      }} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ paddingTop: 52, paddingBottom: 28, animation: "fadeUp 0.5s ease-out" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>MY</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, background: "linear-gradient(135deg, #f97316, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>ROUTINES</span>
          </div>
          <div style={{ color: "#4b4b60", fontSize: 12, letterSpacing: 1, fontWeight: 500 }}>
            {routines.length} PROGRAMS · PICK ANY WHEN YOU TRAIN
          </div>
        </div>

        {/* ── Routine selector strip ── */}
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${routines.length}, 1fr)`, gap: 8,
          marginBottom: 24, animation: "fadeUp 0.55s ease-out",
        }}>
          {routines.map(r => {
            const isSelected = selectedId === r.id;
            return (
              <button key={r.id} onClick={() => setSelectedId(isSelected ? null : r.id)} style={{
                background: isSelected ? `${r.color}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${isSelected ? r.color : "rgba(255,255,255,0.07)"}`,
                borderRadius: 18, padding: "14px 6px", cursor: "pointer",
                transition: "all 0.22s ease",
                boxShadow: isSelected ? `0 0 24px ${r.glow}` : "none",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
              }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = `${r.color}50`; e.currentTarget.style.background = `${r.color}08`; }}}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: isSelected ? `${r.color}25` : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.22s ease",
                }}>
                  <RoutineIcon type={r.type} size={18} color={isSelected ? r.color : "#3a3a52"} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  color: isSelected ? r.color : "#4b4b60",
                  textTransform: "uppercase", transition: "color 0.2s ease",
                }}>
                  {r.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Selected routine detail ── */}
        {selected ? (
          <div key={selected.id} style={{ animation: "fadeUp 0.35s ease-out" }}>
            {/* Routine hero card */}
            <div style={{
              background: "rgba(255,255,255,0.025)", border: `1px solid ${selected.color}30`,
              borderRadius: 22, padding: "20px 22px", marginBottom: 12,
              boxShadow: `0 0 40px ${selected.glow}`,
              backdropFilter: "blur(16px)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 14,
                      background: `${selected.color}18`, border: `1px solid ${selected.color}35`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <RoutineIcon type={selected.type} size={22} color={selected.color} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 2, color: selected.color, lineHeight: 1 }}>
                        {selected.name}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selected.muscles.map(m => (
                      <span key={m} style={{
                        background: `${selected.color}12`, border: `1px solid ${selected.color}30`,
                        color: selected.color, borderRadius: 20, padding: "3px 10px",
                        fontSize: 11, fontWeight: 600,
                      }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ color: selected.color, fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>
                    {selected.exercises.length}
                  </div>
                  <div style={{ color: "#4b4b60", fontSize: 10, letterSpacing: 0.5, fontWeight: 600 }}>EXERCISES</div>
                  <div style={{ color: selected.color, fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, marginTop: 6 }}>
                    {selected.exercises.reduce((a, e) => a + e.sets, 0)}
                  </div>
                  <div style={{ color: "#4b4b60", fontSize: 10, letterSpacing: 0.5, fontWeight: 600 }}>TOTAL SETS</div>
                </div>
              </div>
            </div>

            {/* Exercise list */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, overflow: "hidden", marginBottom: 12 }}>
              {selected.exercises.map((ex, i) => (
                <div key={i} style={{
                  padding: "16px 20px",
                  borderBottom: i < selected.exercises.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  display: "flex", flexDirection: "column", gap: 8,
                  transition: "background 0.15s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0fa", lineHeight: 1.2, marginBottom: 3 }}>{ex.name}</div>
                      {ex.note && <div style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>{ex.note}</div>}
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 14, flexShrink: 0 }}>
                      <div style={{ color: selected.color, fontWeight: 700, fontSize: 14 }}>{ex.weight}</div>
                      <div style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}>{ex.reps}</div>
                    </div>
                  </div>
                  <SetPips count={ex.sets} color={selected.color} />
                </div>
              ))}
            </div>

            {/* CTA */}
            <a href="/log" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginBottom: 24, textAlign: "center",
              background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`,
              color: "#fff", borderRadius: 18, padding: "15px 24px",
              textDecoration: "none", fontWeight: 700, fontSize: 15,
              boxShadow: `0 4px 24px ${selected.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
              transition: "transform 0.15s ease, box-shadow 0.2s ease",
            }}>
              Start {selected.name} workout
              <ChevronRight size={18} strokeWidth={2.5} />
            </a>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, padding: 36, textAlign: "center", marginBottom: 24, animation: "fadeUp 0.5s ease-out" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <Dumbbell size={24} color="#f97316" strokeWidth={2} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>
              SELECT A ROUTINE
            </div>
            <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>
              Tap a routine above to preview its exercises. Pick any routine on any day — train on your schedule.
            </div>
          </div>
        )}

        {/* ── Targets section ── */}
        <div style={{ marginBottom: 20, animation: "fadeUp 0.7s ease-out" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Target size={16} color="#f97316" strokeWidth={2.5} />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, color: "#fff" }}>
              2-WEEK TARGETS
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
            {targets.map((t, i) => {
              const cfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={i} style={{
                  padding: "14px 20px",
                  borderBottom: i < targets.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0fa", marginBottom: 3 }}>{t.exercise}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {t.from}
                      <span style={{ color: "#4b4b60", margin: "0 5px" }}>→</span>
                      <span style={{ color: "#f0f0fa", fontWeight: 600 }}>{t.to}</span>
                    </div>
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                    flexShrink: 0, marginLeft: 12,
                  }}>
                    {t.status === "ready" && <Check size={11} strokeWidth={3} />}
                    {cfg.label.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rest reminder */}
        <div style={{
          padding: "12px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 14, fontSize: 12, color: "#4b4b60", textAlign: "center", lineHeight: 1.7,
          marginBottom: 8,
        }}>
          60–90 sec rest between sets · Listen to your body and rest when needed
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
