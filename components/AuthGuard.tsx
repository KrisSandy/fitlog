"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const [ready, setReady] = useState(isPublic);

  useEffect(() => {
    if (isPublic) { setReady(true); return; }

    const supabase = createClient();

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    });

    // Stay in sync if the user signs out from another tab / token expires
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => subscription.unsubscribe();
  }, [isPublic, pathname, router]);

  if (!ready) return null; // blank screen while checking — no flash of protected content

  return <>{children}</>;
}
