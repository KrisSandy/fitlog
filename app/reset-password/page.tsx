"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    // Supabase appends #access_token=... to the URL from the reset email.
    // getSession() picks it up automatically from the hash.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else setError("Invalid or expired reset link. Please request a new one.");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) { setError(error.message); setLoading(false); }
    else {
      setDone(true);
      setTimeout(() => router.replace("/"), 2000);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: "rgba(15,15,24,0.6)", border: "1px solid #1e1e2e", borderRadius: 14,
    padding: "14px 14px 14px 44px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box", backdropFilter: "blur(8px)",
    transition: "border-color 0.2s ease",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#08080f",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif", padding: 24,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: done
              ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))"
              : "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))",
            border: `1px solid ${done ? "rgba(34,197,94,0.3)" : "rgba(249,115,22,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", boxShadow: done ? "0 8px 32px rgba(34,197,94,0.12)" : "0 8px 32px rgba(249,115,22,0.1)",
            transition: "all 0.4s ease",
          }}>
            {done
              ? <CheckCircle2 size={28} color="#22c55e" strokeWidth={2.5} />
              : <Dumbbell     size={28} color="#f97316" strokeWidth={2.5} />
            }
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 3, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
            {done ? "PASSWORD UPDATED" : "NEW PASSWORD"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            {done ? "Redirecting you to the app…" : "Choose a strong password"}
          </p>
        </div>

        {!done && ready && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="New password (min 6 chars)" style={fieldStyle}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password" style={fieldStyle}
              />
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: "linear-gradient(135deg, #f97316, #ea580c)",
              border: "none", borderRadius: 16, padding: "16px",
              color: "#fff", cursor: loading ? "wait" : "pointer",
              fontSize: 15, fontWeight: 700, fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              opacity: loading ? 0.7 : 1, transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4,
            }}>
              {loading
                ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Updating…</>
                : <>Update password <ArrowRight size={16} /></>
              }
            </button>
          </form>
        )}

        {!ready && !done && (
          <div style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontSize: 13, textAlign: "center" }}>
            {error || "Verifying link…"}
            {error && (
              <div style={{ marginTop: 14 }}>
                <Link href="/forgot-password" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>
                  Request a new link →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
