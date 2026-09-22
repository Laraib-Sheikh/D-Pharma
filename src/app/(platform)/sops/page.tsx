"use client";

import { useState } from "react";
import { PageHeader, Panel } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { usePlatform } from "@/lib/store";

export default function SopsPage() {
  const { sops, acknowledgeSop, hasAcknowledgedToday, acknowledgments, user } = usePlatform();
  const [showArchived, setShowArchived] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!user) return null;

  const visible = sops.filter((s) => (showArchived ? true : s.status === "current"));

  return (
    <div>
      <PageHeader
        eyebrow="Module 3.4"
        title="SOP & document control"
        description="Current approved procedures for the floor. Daily acknowledgment is required before batch work can start."
        actions={
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink-muted)]"
          >
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
        }
      />

      {toast && (
        <div className="mb-4 rounded-lg bg-[var(--ok-soft)] px-4 py-3 text-sm text-[var(--ok)]">
          {toast}
        </div>
      )}

      <div className="grid gap-4">
        {visible.map((sop) => {
          const done = hasAcknowledgedToday(sop.id);
          const myAck = acknowledgments.find(
            (a) =>
              a.sopId === sop.id &&
              a.userId === user.id &&
              a.date === new Date().toISOString().slice(0, 10),
          );
          return (
            <Panel key={`${sop.id}-${sop.version}`} className="animate-rise p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                      {sop.code}
                    </p>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        sop.status === "current"
                          ? "bg-[var(--ok-soft)] text-[var(--ok)]"
                          : "bg-[#edf2f5] text-[var(--ink-muted)]"
                      }`}
                    >
                      {sop.status === "current" ? `Current v${sop.version}` : `Archived v${sop.version}`}
                    </span>
                    <span className="rounded bg-[var(--brand-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--brand-deep)]">
                      {sop.category}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">{sop.title}</h2>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">{sop.summary}</p>
                  <p className="mt-2 text-xs text-[var(--ink-muted)]">
                    Effective {sop.effectiveDate}
                    {myAck ? ` · Acknowledged today at ${formatDateTime(myAck.at)}` : ""}
                  </p>
                </div>

                {sop.status === "current" && sop.acknowledgmentsRequired ? (
                  <button
                    type="button"
                    disabled={done}
                    onClick={() => {
                      acknowledgeSop(sop.id);
                      setToast(`Acknowledged ${sop.code} v${sop.version} for this shift.`);
                    }}
                    className="shrink-0 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-default disabled:bg-[var(--ok)]"
                  >
                    {done ? "Acknowledged today" : "Acknowledge for shift"}
                  </button>
                ) : null}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
