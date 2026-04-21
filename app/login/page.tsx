"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Dumbbell, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: "rgba(15,15,24,0.6)", border: "1px solid #1e1e2e", borderRadius: 14,
    padding: "14px 14px 14px 44px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box", backdropFilter: "blur(8px)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif", padding: 24,
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1, animation: "fadeUp 0.6s ease-out" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))",
            border: "1px solid rgba(249,115,22,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 8px 32px rgba(249,115,22,0.1)",
          }}>
            <Dumbbell size={28} color="#f97316" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 44, letterSpacing: 4, color: "#fff", lineHeight: 1, marginBottom: 8,
          }}>FITLOG</h1>
          <p style={{ color: "#6b7280", fontSize: 14, letterSpacing: 0.5 }}>Welcome back, athlete</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <Mail size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={fieldStyle}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={fieldStyle}
            />
          </div>

          {error && (
            <div style={{
              padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12, color: "#ef4444", fontSize: 13, animation: "scaleIn 0.2s ease-out",
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", background: "linear-gradient(135deg, #f97316, #ea580c)",
            border: "none", borderRadius: 16,
            padding: "16px 16px", color: "#fff", cursor: loading ? "wait" : "pointer",
            fontSize: 15, fontWeight: 600, fontFamily: "inherit",
            boxShadow: "0 4px 24px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            opacity: loading ? 0.7 : 1, transition: "all 0.2s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginTop: 4,
          }}>
            {loading ? (
              <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Logging in...</>
            ) : (
              <>Log In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 28, color: "#4b4b60", fontSize: 14 }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600, transition: "opacity 0.15s" }}>Sign Up</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
