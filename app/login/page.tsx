"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Dumbbell, Mail, Lock, ArrowRight, Loader2, RefreshCw, MailCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Resend state — shown when Supabase returns "Email not confirmed"
  const [showResend, setShowResend]   = useState(false);
  const [resending, setResending]     = useState(false);
  const [resendDone, setResendDone]   = useState(false);
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown]       = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setResendDone(false);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      // Offer resend if the email hasn't been confirmed yet
      if (error.message.toLowerCase().includes("not confirmed") ||
          error.message.toLowerCase().includes("email not confirmed")) {
        setShowResend(true);
      }
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    setResendError("");
    setResendDone(false);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });

    if (error) { setResendError(error.message); }
    else        { setResendDone(true); setCooldown(60); }
    setResending(false);
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: "rgba(15,15,24,0.6)", border: "1px solid #1e1e2e", borderRadius: 14,
    padding: "14px 14px 14px 44px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box", backdropFilter: "blur(8px)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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

      <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1, animation: "fadeUp 0.6s ease-out" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))",
            border: "1px solid rgba(249,115,22,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(249,115,22,0.1)",
          }}>
            <Dumbbell size={28} color="#f97316" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: 4, color: "#fff", lineHeight: 1, marginBottom: 8 }}>FITLOG</h1>
          <p style={{ color: "#6b7280", fontSize: 14, letterSpacing: 0.5 }}>Welcome back, athlete</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <Mail size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={fieldStyle} />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" style={fieldStyle} />
          </div>

          {/* Error + optional resend block */}
          {error && (
            <div style={{ animation: "scaleIn 0.2s ease-out" }}>
              <div style={{
                padding: "12px 16px",
                background: showResend ? "rgba(249,115,22,0.06)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${showResend ? "rgba(249,115,22,0.2)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: showResend ? "12px 12px 0 0" : 12,
                color: showResend ? "#f97316" : "#ef4444",
                fontSize: 13,
              }}>
                {error}
              </div>

              {showResend && (
                <div style={{
                  background: "rgba(249,115,22,0.04)",
                  border: "1px solid rgba(249,115,22,0.15)",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  padding: "12px 16px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
                    You need to confirm your email before logging in.
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || cooldown > 0}
                    style={{
                      background: resendDone ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.12)",
                      border: `1px solid ${resendDone ? "rgba(34,197,94,0.3)" : "rgba(249,115,22,0.3)"}`,
                      borderRadius: 10, padding: "9px 14px",
                      color: resendDone ? "#22c55e" : cooldown > 0 ? "#6b7280" : "#f97316",
                      cursor: resending || cooldown > 0 ? "default" : "pointer",
                      fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 7,
                      opacity: cooldown > 0 && !resendDone ? 0.6 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {resending ? (
                      <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Sending…</>
                    ) : resendDone ? (
                      <><MailCheck size={13} /> Sent! Check your inbox {cooldown > 0 ? `(${cooldown}s)` : ""}</>
                    ) : cooldown > 0 ? (
                      <><RefreshCw size={13} /> Resend in {cooldown}s</>
                    ) : (
                      <><RefreshCw size={13} /> Resend confirmation email</>
                    )}
                  </button>
                  {resendError && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{resendError}</p>}
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", background: "linear-gradient(135deg, #f97316, #ea580c)",
            border: "none", borderRadius: 16, padding: "16px 16px",
            color: "#fff", cursor: loading ? "wait" : "pointer",
            fontSize: 15, fontWeight: 700, fontFamily: "inherit",
            boxShadow: "0 4px 24px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            opacity: loading ? 0.7 : 1, transition: "all 0.2s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4,
          }}>
            {loading
              ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Logging in…</>
              : <>Log In <ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 28, color: "#4b4b60", fontSize: 14 }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
