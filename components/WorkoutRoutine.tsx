"use client";
import { useState } from "react";
import { days } from "@/lib/routineData";

const targets = [
  { exercise: "Shoulder Press", from: "6kg", to: "8kg", status: "ready" },
  { exercise: "Hammer Curl", from: "6kg", to: "8kg", status: "ready" },
  { exercise: "Cable Row", from: "45kg", to: "50kg", status: "building" },
  { exercise: "Bench Press", from: "20kg", to: "25kg consistent", status: "reset" },
];

function SetDots({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: color, opacity: 0.8 }} />
      ))}
    </div>
  );
}

export default function WorkoutRoutine() {
  const [selected, setSelected] = useState("mon");
  const activeDay = days.find(d => d.id === selected)!;

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Outfit', sans-serif", color: "#e8e8f0", padding: "24px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>WEEKLY</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, background: "linear-gradient(135deg, #f97316, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>ROUTINE</span>
          </div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4, letterSpacing: 1 }}>PERSONALISED · WEEK 5 · 4 TRAINING DAYS</div>
        </div>

        {/* Day strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 24 }}>
          {days.map(day => (
            <button key={day.id} onClick={() => setSelected(day.id)} style={{
              background: selected === day.id ? day.color : day.type === "rest" ? "#111118" : "#13131e",
              border: `1px solid ${selected === day.id ? day.color : "#1e1e2e"}`,
              borderRadius: 12, padding: "10px 4px", cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: selected === day.id ? `0 0 20px ${day.glow}` : "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4
            }}>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: selected === day.id ? "#fff" : "#6b7280" }}>{day.label}</span>
              <span style={{ fontSize: 16 }}>{day.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, color: selected === day.id ? "rgba(255,255,255,0.9)" : "#4b4b60", textTransform: "uppercase" }}>{day.name}</span>
            </button>
          ))}
        </div>

        {/* Day detail */}
        <div key={selected}>
          {activeDay.type === "rest" ? (
            <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 20, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: "#fff" }}>REST DAY</div>
              <div style={{ color: "#6b7280", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
                Muscles grow during recovery, not during training. Sleep 7–9hrs, stay hydrated, eat enough protein.
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                {["💧 Hydrate", "🥗 Eat well", "🛏️ Sleep 8hr"].map(tip => (
                  <div key={tip} style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: 20, padding: "6px 12px", fontSize: 12, color: "#9ca3af" }}>{tip}</div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div style={{ background: "#0f0f18", border: `1px solid ${activeDay.color}30`, borderRadius: 20, padding: "16px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 0 30px ${activeDay.glow}` }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: activeDay.color, lineHeight: 1 }}>{activeDay.name} Day</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {activeDay.muscles.map(m => (
                      <span key={m} style={{ background: `${activeDay.color}15`, border: `1px solid ${activeDay.color}40`, color: activeDay.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: activeDay.color, fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{activeDay.exercises.length}</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>EXERCISES</div>
                  <div style={{ color: activeDay.color, fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, marginTop: 2 }}>{activeDay.exercises.reduce((a, e) => a + e.sets, 0)}</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>TOTAL SETS</div>
                </div>
              </div>

              <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 20, overflow: "hidden" }}>
                {activeDay.exercises.map((ex, i) => (
                  <div key={i} style={{ padding: "14px 18px", borderBottom: i < activeDay.exercises.length - 1 ? "1px solid #1a1a28" : "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.2 }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, fontStyle: "italic" }}>{ex.note}</div>
                      </div>
                      <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
                        <div style={{ color: activeDay.color, fontWeight: 700, fontSize: 14 }}>{ex.weight}</div>
                        <div style={{ color: "#9ca3af", fontSize: 11 }}>{ex.reps}</div>
                      </div>
                    </div>
                    <SetDots count={ex.sets} color={activeDay.color} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Targets */}
        <div style={{ marginTop: 20, background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #1a1a28", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, color: "#fff" }}>2-WEEK TARGETS</span>
          </div>
          {targets.map((t, i) => (
            <div key={i} style={{ padding: "12px 18px", borderBottom: i < targets.length - 1 ? "1px solid #1a1a28" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e8e8f0" }}>{t.exercise}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{t.from} → <span style={{ color: "#e8e8f0" }}>{t.to}</span></div>
              </div>
              <div style={{
                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: t.status === "ready" ? "rgba(34,197,94,0.15)" : t.status === "building" ? "rgba(249,115,22,0.15)" : "rgba(239,68,68,0.15)",
                color: t.status === "ready" ? "#22c55e" : t.status === "building" ? "#f97316" : "#ef4444",
                border: `1px solid ${t.status === "ready" ? "#22c55e40" : t.status === "building" ? "#f9731640" : "#ef444440"}`
              }}>
                {t.status === "ready" ? "✓ READY" : t.status === "building" ? "BUILDING" : "RESET"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: "12px 18px", background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 16, fontSize: 12, color: "#6b7280", textAlign: "center", lineHeight: 1.6 }}>
          60–90 sec rest between sets · Wed, Fri, Sun = full rest
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/" style={{ color: "#6b7280", fontSize: 13, textDecoration: "none" }}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}
