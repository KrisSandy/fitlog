"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Dumbbell, Activity } from "lucide-react";
import { useState, useEffect } from "react";

const tabs = [
  { href: "/",        icon: Home,     label: "Home"    },
  { href: "/routine", icon: Dumbbell, label: "Train",  primary: true },
  { href: "/history", icon: Activity, label: "History" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(6,6,14,0.97)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-around",
      height: 76,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = tab.href === "/"
          ? pathname === "/"
          : pathname.startsWith(tab.href);

        if (tab.primary) {
          return (
            <Link key={tab.href} href={tab.href} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, textDecoration: "none", flex: 1,
              padding: "8px 0",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: isActive
                  ? "linear-gradient(135deg, #f97316, #ea580c)"
                  : "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(234,88,12,0.12))",
                border: isActive ? "none" : "1px solid rgba(249,115,22,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isActive
                  ? "0 0 20px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 0 12px rgba(249,115,22,0.15)",
                transition: "all 0.2s ease",
              }}>
                <Icon size={20} color={isActive ? "#fff" : "#f97316"} strokeWidth={2.5} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
                color: isActive ? "#f97316" : "rgba(249,115,22,0.5)",
                fontFamily: "'Outfit', sans-serif",
                textTransform: "uppercase",
                transition: "color 0.2s ease",
              }}>
                {tab.label}
              </span>
            </Link>
          );
        }

        return (
          <Link key={tab.href} href={tab.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 4, textDecoration: "none", flex: 1,
            padding: "8px 0",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: isActive ? "rgba(249,115,22,0.12)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s ease",
            }}>
              <Icon
                size={20}
                color={isActive ? "#f97316" : "#3a3a52"}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
              color: isActive ? "#f97316" : "#3a3a52",
              fontFamily: "'Outfit', sans-serif",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
