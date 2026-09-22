"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { roleLabel } from "@/lib/format";
import { usePlatform } from "@/lib/store";

const NAV = [
  { href: "/dashboard", label: "Dashboard", roles: null },
  { href: "/batches", label: "Batch records", roles: null },
  { href: "/sops", label: "SOP control", roles: null },
  { href: "/attendance", label: "Attendance", roles: null },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, user, logout, todayAttendance } = usePlatform();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--ink-muted)]">
        Loading platform…
      </div>
    );
  }

  return (
    <div className="min-h-screen atmosphere-grid">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col border-r border-[var(--line)] bg-[rgba(247,250,251,0.92)] px-4 py-6 backdrop-blur">
          <div className="px-2">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--brand-deep)]">
              D-Pharma
            </p>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">Employee Platform</p>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--brand)] text-white"
                      : "text-[var(--ink-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-lg border border-[var(--line)] bg-white/70 p-3">
            <p className="text-sm font-semibold text-[var(--ink)]">{user.name}</p>
            <p className="text-xs text-[var(--ink-muted)]">{roleLabel(user.role)}</p>
            <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
              Today:{" "}
              {todayAttendance?.clockIn
                ? todayAttendance.clockOut
                  ? "Clocked out"
                  : "On shift"
                : "Not clocked in"}
            </p>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="mt-3 w-full rounded-md border border-[var(--line)] px-2 py-1.5 text-xs font-medium text-[var(--ink-muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
