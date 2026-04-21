"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try profile display_name, fall back to email prefix
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        setDisplayName(profile?.display_name || user.email?.split("@")[0] || "Athlete");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main style={{
      minHeight: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 52, letterSpacing: 4, color: "#fff", lineHeight: 1, marginBottom: 8,
        }}>FITLOG</h1>

        {!loading && displayName && (
          <p style={{ color: "#f97316", fontSize: 15, marginBottom: 4, fontWeight: 600 }}>
            Hey, {displayName}
          </p>
        )}
        <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 40 }}>
          Your personal workout tracker
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/routine" style={{
            background: "#f97316", color: "#fff", borderRadius: 14,
            padding: "14px 24px", textDecoration: "none", fontWeight: 600,
            fontSize: 15, display: "block",
            boxShadow: "0 0 20px rgba(249,115,22,0.3)",
          }}>
            📋 My Routines
          </Link>
          <Link href="/log" style={{
            background: "#13131e", border: "1px solid #2a2a3a",
            color: "#e8e8f0", borderRadius: 14,
            padding: "14px 24px", textDecoration: "none", fontWeight: 600,
            fontSize: 15, display: "block",
          }}>
            ➕ Log a Workout
          </Link>
          <Link href="/history" style={{
            background: "#13131e", border: "1px solid #2a2a3a",
            color: "#e8e8f0", borderRadius: 14,
            padding: "14px 24px", textDecoration: "none", fontWeight: 600,
            fontSize: 15, display: "block",
          }}>
            📊 Workout History
          </Link>
        </div>

        <button onClick={handleLogout} style={{
          marginTop: 32, background: "transparent", border: "1px solid #2a2a3a",
          borderRadius: 10, padding: "8px 20px", color: "#6b7280", cursor: "pointer",
          fontSize: 13, fontFamily: "inherit", transition: "all 0.15s ease",
        }}>
          Log Out
        </button>
      </div>
    </main>
  );
}
