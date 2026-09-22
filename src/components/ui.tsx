import type { ReactNode } from "react";
import { batchStatusLabel, stepStatusLabel } from "@/lib/format";
import type { BatchStatus, BatchStepStatus } from "@/lib/types";

const batchTone: Record<BatchStatus, string> = {
  draft: "bg-[var(--brand-soft)] text-[var(--brand-deep)]",
  sop_pending: "bg-[var(--warn-soft)] text-[var(--warn)]",
  in_progress: "bg-[var(--brand-soft)] text-[var(--brand)]",
  awaiting_supervisor: "bg-[var(--warn-soft)] text-[var(--warn)]",
  submitted_qc: "bg-[var(--ok-soft)] text-[var(--ok)]",
  completed: "bg-[var(--ok-soft)] text-[var(--ok)]",
  rejected: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const stepTone: Record<BatchStepStatus, string> = {
  pending: "bg-[#edf2f5] text-[var(--ink-muted)]",
  in_progress: "bg-[var(--brand-soft)] text-[var(--brand)]",
  awaiting_signoff: "bg-[var(--warn-soft)] text-[var(--warn)]",
  completed: "bg-[var(--ok-soft)] text-[var(--ok)]",
  deviation: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold tracking-wide ${batchTone[status]}`}
    >
      {batchStatusLabel(status)}
    </span>
  );
}

export function StepStatusBadge({ status }: { status: BatchStepStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold tracking-wide ${stepTone[status]}`}
    >
      {stepStatusLabel(status)}
    </span>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] shadow-[var(--shadow)] ${className}`}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-rise">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="animate-rise-delay flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
