"use client";
import { useState } from "react";
import { routines } from "@/lib/routineData";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? routines.find(r => r.id === selectedId) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Outfit', sans-serif", color: "#e8e8f0", padding: "24px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>MY</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 3, background: "linear-gradient(135deg, #f97316, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>ROUTINES</span>
          </div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4, letterSpacing: 1 }}>{routines.length} ROUTINES · PICK ANY WHEN YOU TRAIN</div>
        </div>

        {/* Routine selector strip */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${routines.length}, 1fr)`, gap: 8, marginBottom: 24 }}>
          {routines.map(r => (
            <button key={r.id} onClick={() => setSelectedId(selectedId === r.id ? null : r.id)} style={{
              background: selectedId === r.id ? r.color : "#13131e",
              border: `1px solid ${selectedId === r.id ? r.color : "#1e1e2e"}`,
              borderRadius: 14, padding: "12px 4px", cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: selectedId === r.id ? `0 0 20px ${r.glow}` : "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: selectedId === r.id ? "#fff" : "#6b7280", textTransform: "uppercase" }}>{r.name}</span>
            </button>
          ))}
        </div>

        {/* Selected routine detail */}
        {selected ? (
          <div key={selected.id}>
            <div style={{
              background: "#0f0f18", border: `1px solid ${selected.color}30`, borderRadius: 20,
              padding: "16px 20px", marginBottom: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: `0 0 30px ${selected.glow}`,
            }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: selected.color, lineHeight: 1 }}>{selected.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {selected.muscles.map(m => (
                    <span key={m} style={{ background: `${selected.color}15`, border: `1px solid ${selected.color}40`, color: selected.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>{m}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: selected.color, fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{selected.exercises.length}</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>EXERCISES</div>
                <div style={{ color: selected.color, fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, marginTop: 2 }}>{selected.exercises.reduce((a, e) => a + e.sets, 0)}</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>TOTAL SETS</div>
              </div>
            </div>

            <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 20, overflow: "hidden" }}>
              {selected.exercises.map((ex, i) => (
                <div key={i} style={{ padding: "14px 18px", borderBottom: i < selected.exercises.length - 1 ? "1px solid #1a1a28" : "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.2 }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, fontStyle: "italic" }}>{ex.note}</div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
                      <div style={{ color: selected.color, fontWeight: 700, fontSize: 14 }}>{ex.weight}</div>
                      <div style={{ color: "#9ca3af", fontSize: 11 }}>{ex.reps}</div>
                    </div>
                  </div>
                  <SetDots count={ex.sets} color={selected.color} />
                </div>
              ))}
            </div>

            {/* Start workout button */}
            <a href="/log" style={{
              display: "block", marginTop: 16, textAlign: "center",
              background: selected.color, color: "#fff", borderRadius: 14,
              padding: "14px 24px", textDecoration: "none", fontWeight: 600, fontSize: 15,
              boxShadow: `0 0 20px ${selected.glow}`,
            }}>
              Start {selected.name} Workout →
            </a>
          </div>
        ) : (
          <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 20, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👆</div>
            <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>
              Tap a routine above to see its exercises. Pick any routine on any day — train on your schedule.
            </div>
          </div>
        )}

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
          60–90 sec rest between sets · Take rest days when your body needs them
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/" style={{ color: "#6b7280", fontSize: 13, textDecoration: "none" }}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}
