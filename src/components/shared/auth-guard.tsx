"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Renders children only for signed-in users. The session lives in localStorage,
 * so the server (and the static shell) renders `fallback` until the browser takes over.
 */
export function AuthGuard({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const user = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (!user) return fallback;
  return children;
}

/** Inverse of AuthGuard: sends signed-in users straight to the dashboard. */
export function GuestOnly() {
  const user = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/overview");
  }, [user, router]);

  return null;
}

export function ContentSkeleton() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

/** Page-level guard: keeps each page segment rendered (as a skeleton) in the static shell. */
export function Protected({ children }: { children: React.ReactNode }) {
  return <AuthGuard fallback={<ContentSkeleton />}>{children}</AuthGuard>;
}
