"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Dumbbell, Mail, Lock, User, ArrowRight, Loader2, MailCheck, RefreshCw } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [displayName, setDisplayName]   = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);

  // Resend state
  const [resending, setResending]       = useState(false);
  const [resendDone, setResendDone]     = useState(false);
  const [resendError, setResendError]   = useState("");
  const [cooldown, setCooldown]         = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

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
      options: { data: { display_name: displayName || email.split("@")[0] } },
    });

    if (error) { setError(error.message); setLoading(false); }
    else        { setSuccess(true);        setLoading(false); }
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

  /* ── Success / check-email screen ── */
  if (success) {
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
          background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ textAlign: "center", maxWidth: 380, position: "relative", zIndex: 1, animation: "scaleIn 0.4s ease-out" }}>
          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 26,
            background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
            border: "1px solid rgba(34,197,94,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 40px rgba(34,197,94,0.12)",
          }}>
            <MailCheck size={36} color="#22c55e" strokeWidth={2} />
          </div>

          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: 2, color: "#fff", marginBottom: 12 }}>
            CHECK YOUR EMAIL
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.75, marginBottom: 32 }}>
            We sent a confirmation link to{" "}
            <span style={{ color: "#f0f0fa", fontWeight: 600 }}>{email}</span>.
            {" "}Click it to activate your account, then come back and log in.
          </p>

          {/* Primary CTA */}
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff", borderRadius: 16, padding: "14px 28px",
            textDecoration: "none", fontWeight: 700, fontSize: 14,
            boxShadow: "0 4px 24px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}>
            Go to login <ArrowRight size={16} />
          </Link>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0 20px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 12, color: "#3a3a52", fontWeight: 600, letterSpacing: 0.5 }}>DIDN'T GET IT?</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)",
              border: `1px solid ${resendDone ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14, padding: "13px 16px",
              color: resendDone ? "#22c55e" : cooldown > 0 ? "#4b4b60" : "#f0f0fa",
              cursor: resending || cooldown > 0 ? "default" : "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
              opacity: cooldown > 0 ? 0.6 : 1,
            }}
          >
            {resending ? (
              <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Sending…</>
            ) : resendDone && cooldown > 0 ? (
              <><MailCheck size={15} /> Sent! Resend in {cooldown}s</>
            ) : cooldown > 0 ? (
              <><RefreshCw size={15} /> Resend in {cooldown}s</>
            ) : (
              <><RefreshCw size={15} /> Resend confirmation email</>
            )}
          </button>

          {resendError && (
            <p style={{ marginTop: 10, fontSize: 13, color: "#ef4444" }}>{resendError}</p>
          )}

          <p style={{ marginTop: 16, fontSize: 12, color: "#3a3a52", lineHeight: 1.6 }}>
            Check your spam folder too. The link expires in 24 hours.
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Signup form ── */
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
        background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
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
          <p style={{ color: "#6b7280", fontSize: 14, letterSpacing: 0.5 }}>Create your account</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <User size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="Display Name (e.g., Sandy)" style={fieldStyle} />
          </div>
          <div style={{ position: "relative" }}>
            <Mail size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={fieldStyle} />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters" style={fieldStyle} />
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontSize: 13, animation: "scaleIn 0.2s ease-out" }}>
              {error}
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
              ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</>
              : <>Sign Up <ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 28, color: "#4b4b60", fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
