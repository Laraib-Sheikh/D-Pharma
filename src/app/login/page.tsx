"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROLE_LABELS } from "@/lib/seed-data";
import { usePlatform } from "@/lib/store";

export default function LoginPage() {
  const { ready, user, users, login } = usePlatform();
  const router = useRouter();
  const [selected, setSelected] = useState(users[0]?.id ?? "");

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--ink-muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden atmosphere-grid">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[rgba(12,92,102,0.12)] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[rgba(201,120,44,0.12)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
        <div className="animate-rise max-w-xl">
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-[var(--brand-deep)] md:text-6xl">
            D-Pharma
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--ink)] md:text-3xl">
            Employee Platform
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ink-muted)]">
            One daily login for batch manufacturing records, SOP acknowledgment, and
            attendance — replacing paper logs on the production floor.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-[var(--ink-muted)]">
            <li>• Guided digital BMR with supervisor checkpoints</li>
            <li>• Shift SOP acknowledgment gate before work starts</li>
            <li>• Attributable audit trail on every entry</li>
          </ul>
        </div>

        <form
          className="animate-rise-delay w-full max-w-md rounded-2xl border border-[var(--line)] bg-[rgba(247,250,251,0.95)] p-7 shadow-[var(--shadow)] backdrop-blur"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selected) return;
            login(selected);
            router.push("/dashboard");
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            Sign in
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">Choose a demo role</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            MVP uses local demo accounts — no password required.
          </p>

          <label className="mt-6 block text-sm font-medium text-[var(--ink)]">
            Employee
            <select
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)] focus:ring-2"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {ROLE_LABELS[u.role]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
          >
            Enter platform
          </button>
        </form>
      </div>
    </div>
  );
}
