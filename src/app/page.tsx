
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard"); // Redirect to a route inside the (app) group
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}

// Let's create a real dashboard route inside the (app) group
// to avoid confusion. I'll create /dashboard and redirect there.
// Create a new file at /src/app/(app)/dashboard/page.tsx
