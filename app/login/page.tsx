"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

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

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💪</div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 44, letterSpacing: 4, color: "#fff", lineHeight: 1, marginBottom: 8,
          }}>FITLOG</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Log in to your account</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%", background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 12,
                padding: "12px 14px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 12,
                padding: "12px 14px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440",
              borderRadius: 10, color: "#ef4444", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", background: "#f97316", border: "none", borderRadius: 14,
            padding: "14px 16px", color: "#fff", cursor: loading ? "wait" : "pointer",
            fontSize: 15, fontWeight: 600, fontFamily: "inherit",
            boxShadow: "0 0 20px rgba(249,115,22,0.3)",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.2s ease",
          }}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "#6b7280", fontSize: 14 }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
