"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080810",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Outfit', sans-serif", padding: 24,
      }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: "#fff", marginBottom: 12 }}>CHECK YOUR EMAIL</h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            We sent a confirmation link to <span style={{ color: "#e8e8f0", fontWeight: 600 }}>{email}</span>. Click it to activate your account, then come back and log in.
          </p>
          <Link href="/login" style={{
            display: "inline-block", background: "#f97316", color: "#fff", borderRadius: 14,
            padding: "12px 24px", textDecoration: "none", fontWeight: 600, fontSize: 14,
            boxShadow: "0 0 20px rgba(249,115,22,0.3)",
          }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Create your account</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>Display Name</label>
            <input
              type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g., Sandy"
              style={{
                width: "100%", background: "#0f0f18", border: "1px solid #1e1e2e", borderRadius: 12,
                padding: "12px 14px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
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
              placeholder="Min 6 characters"
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "#6b7280", fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}
