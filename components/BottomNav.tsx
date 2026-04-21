"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Dumbbell, Plus, Activity } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/routine", icon: Dumbbell, label: "Train" },
  { href: "/log", icon: Plus, label: "Log", primary: true },
  { href: "/history", icon: Activity, label: "History" },
];

export default function BottomNav() {
  const pathname = usePathname();

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
              justifyContent: "center", textDecoration: "none", flex: 1,
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: "50%",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 28px rgba(249,115,22,0.45), 0 4px 16px rgba(0,0,0,0.4)",
                transform: "translateY(-10px)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}>
                <Icon size={24} color="#fff" strokeWidth={2.5} />
              </div>
            </Link>
          );
        }

        return (
          <Link key={tab.href} href={tab.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 4, textDecoration: "none", flex: 1,
            padding: "8px 0", transition: "opacity 0.15s ease",
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
