"use client";

import Link from "next/link";
import { BatchStatusBadge, PageHeader, Panel } from "@/components/ui";
import { formatTime } from "@/lib/format";
import { usePlatform } from "@/lib/store";

export default function DashboardPage() {
  const {
    user,
    batches,
    sops,
    hasAcknowledgedToday,
    todayAttendance,
    acknowledgments,
  } = usePlatform();

  if (!user) return null;

  const myBatches = batches.filter(
    (b) =>
      b.assignedTo === user.id ||
      user.role === "supervisor" ||
      user.role === "manager" ||
      user.role === "qc" ||
      user.role === "compliance",
  );
  const active = myBatches.filter((b) =>
    ["in_progress", "sop_pending", "awaiting_supervisor"].includes(b.status),
  );
  const currentSops = sops.filter((s) => s.status === "current" && s.acknowledgmentsRequired);
  const pendingSops = currentSops.filter((s) => !hasAcknowledgedToday(s.id));
  const awaitingSignoff = batches.filter((b) =>
    b.steps.some((s) => s.status === "awaiting_signoff" || s.status === "deviation"),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Today on the floor"
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description="Your daily workspace for batch work, SOP compliance, and shift attendance."
        actions={
          <Link
            href="/batches"
            className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            Open batch records
          </Link>
        }
      />

      <div className="animate-rise grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Active batches"
          value={String(active.length)}
          hint="Assigned or visible to you"
        />
        <Stat
          label="SOP acknowledgments"
          value={`${currentSops.length - pendingSops.length}/${currentSops.length}`}
          hint={pendingSops.length ? `${pendingSops.length} still pending today` : "All clear for today"}
        />
        <Stat
          label="Attendance"
          value={
            todayAttendance?.clockIn
              ? todayAttendance.clockOut
                ? "Out"
                : "On shift"
              : "Not in"
          }
          hint={
            todayAttendance?.clockIn
              ? `In at ${formatTime(todayAttendance.clockIn)}`
              : "Clock in from Attendance"
          }
        />
        <Stat
          label="Pending sign-offs"
          value={String(awaitingSignoff.length)}
          hint="Batches waiting on supervisor"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Panel className="animate-rise-delay lg:col-span-3">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-lg font-semibold">Your batch queue</h2>
            <p className="text-sm text-[var(--ink-muted)]">Continue where the shift left off.</p>
          </div>
          <ul className="divide-y divide-[var(--line)]">
            {active.length === 0 ? (
              <li className="px-5 py-8 text-sm text-[var(--ink-muted)]">No active batches.</li>
            ) : (
              active.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/batches/${b.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[var(--brand-soft)]/40"
                  >
                    <div>
                      <p className="font-semibold text-[var(--ink)]">{b.batchNumber}</p>
                      <p className="text-sm text-[var(--ink-muted)]">{b.productName}</p>
                    </div>
                    <BatchStatusBadge status={b.status} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Panel>

        <Panel className="animate-rise-delay lg:col-span-2">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-lg font-semibold">SOP checklist</h2>
            <p className="text-sm text-[var(--ink-muted)]">Must acknowledge before starting work.</p>
          </div>
          <ul className="divide-y divide-[var(--line)]">
            {currentSops.map((sop) => {
              const done = hasAcknowledgedToday(sop.id);
              return (
                <li key={sop.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold">{sop.code}</p>
                    <p className="text-xs text-[var(--ink-muted)]">v{sop.version}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      done
                        ? "bg-[var(--ok-soft)] text-[var(--ok)]"
                        : "bg-[var(--warn-soft)] text-[var(--warn)]"
                    }`}
                  >
                    {done ? "Done" : "Pending"}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[var(--line)] px-5 py-3">
            <Link href="/sops" className="text-sm font-semibold text-[var(--brand)] hover:underline">
              Open SOP control →
            </Link>
          </div>
          <p className="sr-only">{acknowledgments.length} acknowledgments stored</p>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-4 shadow-[var(--shadow)]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--brand-deep)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">{hint}</p>
    </div>
  );
}
