"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Dumbbell, Mail, ArrowRight, ArrowLeft, Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) { setError(error.message); setLoading(false); }
    else        { setSent(true); setLoading(false); }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: "rgba(15,15,24,0.6)", border: "1px solid #1e1e2e", borderRadius: 14,
    padding: "14px 14px 14px 44px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box", backdropFilter: "blur(8px)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  if (sent) {
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

        <div style={{ textAlign: "center", maxWidth: 380, position: "relative", zIndex: 1 }}>
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
            We sent a reset link to{" "}
            <span style={{ color: "#f0f0fa", fontWeight: 600 }}>{email}</span>.
            {" "}Click it to choose a new password.
          </p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff", borderRadius: 16, padding: "14px 28px",
            textDecoration: "none", fontWeight: 700, fontSize: 14,
            boxShadow: "0 4px 24px rgba(249,115,22,0.3)",
          }}>
            Back to login <ArrowRight size={16} />
          </Link>
          <p style={{ marginTop: 20, fontSize: 12, color: "#3a3a52", lineHeight: 1.6 }}>
            Check your spam folder too. The link expires in 1 hour.
          </p>
        </div>
      </div>
    );
  }

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
            background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))",
            border: "1px solid rgba(249,115,22,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(249,115,22,0.1)",
          }}>
            <Dumbbell size={28} color="#f97316" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: 4, color: "#fff", lineHeight: 1, marginBottom: 8 }}>FITLOG</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>We'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <Mail size={16} color="#4b4b60" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={fieldStyle}
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
              ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Sending…</>
              : <>Send reset link <ArrowRight size={16} /></>
            }
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/login" style={{ color: "#4b4b60", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
