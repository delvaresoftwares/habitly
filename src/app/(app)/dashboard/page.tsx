
"use client";

import Dashboard from "@/components/dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // The layout handles loading and auth checks
  if (loading || !user) {
    return null;
  }

  return (
    <main>
      <Dashboard />
    </main>
  );
}

