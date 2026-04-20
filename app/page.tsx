import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif", padding: 24
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 52, letterSpacing: 4, color: "#fff", lineHeight: 1, marginBottom: 8
        }}>FITLOG</h1>
        <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 40 }}>
          Your personal workout tracker + AI coach
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/routine" style={{
            background: "#f97316", color: "#fff", borderRadius: 14,
            padding: "14px 24px", textDecoration: "none", fontWeight: 600,
            fontSize: 15, display: "block",
            boxShadow: "0 0 20px rgba(249,115,22,0.3)"
          }}>
            📅 View Weekly Routine
          </Link>
          <Link href="/log" style={{
            background: "#13131e", border: "1px solid #2a2a3a",
            color: "#e8e8f0", borderRadius: 14,
            padding: "14px 24px", textDecoration: "none", fontWeight: 600,
            fontSize: 15, display: "block"
          }}>
            ➕ Log a Workout
          </Link>
          <Link href="/history" style={{
            background: "#13131e", border: "1px solid #2a2a3a",
            color: "#e8e8f0", borderRadius: 14,
            padding: "14px 24px", textDecoration: "none", fontWeight: 600,
            fontSize: 15, display: "block"
          }}>
            📊 Workout History
          </Link>
        </div>
      </div>
    </main>
  );
}
