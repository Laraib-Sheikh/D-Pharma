"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BatchStatusBadge, PageHeader, Panel, StepStatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { usePlatform } from "@/lib/store";

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    user,
    users,
    batches,
    sops,
    hasAcknowledgedToday,
    startBatch,
    updateStepFields,
    completeStep,
    signOffStep,
  } = usePlatform();

  const batch = batches.find((b) => b.id === params.id);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sop = useMemo(
    () => (batch ? sops.find((s) => s.id === batch.sopId) : undefined),
    [batch, sops],
  );
  const assignee = users.find((u) => u.id === batch?.assignedTo);
  const activeStep = batch?.steps.find(
    (s) =>
      s.status === "in_progress" ||
      s.status === "awaiting_signoff" ||
      s.status === "deviation",
  );

  const [draft, setDraft] = useState<Record<string, string>>({});

  if (!user) return null;
  if (!batch) {
    return (
      <div>
        <PageHeader title="Batch not found" description="This BMR may have been removed." />
        <Link href="/batches" className="text-[var(--brand)] hover:underline">
          ← Back to batches
        </Link>
      </div>
    );
  }

  const sopOk = hasAcknowledgedToday(batch.sopId);
  const canOperate =
    batch.assignedTo === user.id || user.role === "supervisor" || user.role === "manager";
  const canSign = user.role === "supervisor" || user.role === "manager";

  const fieldClass =
    "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--brand-soft)]";

  return (
    <div>
      <PageHeader
        eyebrow="Digital BMR"
        title={batch.batchNumber}
        description={batch.productName}
        actions={
          <Link
            href="/batches"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            All batches
          </Link>
        }
      />

      {(message || error) && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            error
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--ok-soft)] text-[var(--ok)]"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Meta label="Status" value={<BatchStatusBadge status={batch.status} />} />
        <Meta label="Operator" value={assignee?.name ?? "—"} />
        <Meta label="SOP" value={`${sop?.code ?? "—"} v${batch.sopVersion}`} />
        <Meta label="Shift" value={batch.shift} />
      </div>

      {batch.status === "sop_pending" && (
        <Panel className="mb-6 border-[var(--warn)]/40 p-5">
          <h2 className="text-lg font-semibold text-[var(--warn)]">SOP gate</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Work cannot start until the assigned operator acknowledges the current SOP for this
            shift.
          </p>
          <p className="mt-3 text-sm">
            Acknowledgment status:{" "}
            <strong className={sopOk ? "text-[var(--ok)]" : "text-[var(--warn)]"}>
              {sopOk ? "Complete for today" : "Pending"}
            </strong>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/sops"
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
            >
              Go to SOP control
            </Link>
            {canOperate && (
              <button
                type="button"
                className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={!sopOk}
                onClick={() => {
                  const res = startBatch(batch.id);
                  if (!res.ok) setError(res.error ?? "Could not start");
                  else {
                    setError(null);
                    setMessage("Batch started — proceed with step 1.");
                  }
                }}
              >
                Start batch
              </button>
            )}
          </div>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {batch.steps.map((step) => {
            const isActive =
              step.status === "in_progress" ||
              step.status === "awaiting_signoff" ||
              step.status === "deviation";
            return (
              <Panel key={step.id} className={`p-5 ${isActive ? "ring-2 ring-[var(--brand)]/25" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                      Step {step.order}
                    </p>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{step.instruction}</p>
                  </div>
                  <StepStatusBadge status={step.status} />
                </div>

                {step.deviationNote && (
                  <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                    Auto-flagged: {step.deviationNote}
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {step.fields.map((field) => {
                    const editable = step.status === "in_progress" && canOperate;
                    const value =
                      draft[`${step.id}:${field.key}`] ?? field.value ?? "";
                    const outOfRange =
                      field.type === "number" &&
                      value !== "" &&
                      ((field.standardMin != null && Number(value) < field.standardMin) ||
                        (field.standardMax != null && Number(value) > field.standardMax));

                    return (
                      <label key={field.key} className="block text-sm font-medium">
                        {field.label}
                        {field.standardMin != null && field.standardMax != null ? (
                          <span className="ml-1 text-xs font-normal text-[var(--ink-muted)]">
                            ({field.standardMin}–{field.standardMax})
                          </span>
                        ) : null}
                        {field.type === "select" ? (
                          <select
                            className={fieldClass}
                            disabled={!editable}
                            value={value}
                            onChange={(e) => {
                              const next = e.target.value;
                              setDraft((d) => ({ ...d, [`${step.id}:${field.key}`]: next }));
                              updateStepFields(batch.id, step.id, { [field.key]: next });
                            }}
                          >
                            <option value="">Select…</option>
                            {field.options?.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={`${fieldClass} ${outOfRange ? "border-[var(--danger)]" : ""}`}
                            type={field.type === "number" ? "number" : field.type === "time" ? "time" : "text"}
                            disabled={!editable}
                            value={value}
                            onChange={(e) => {
                              const next = e.target.value;
                              setDraft((d) => ({ ...d, [`${step.id}:${field.key}`]: next }));
                              updateStepFields(batch.id, step.id, { [field.key]: next });
                            }}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {step.status === "in_progress" && canOperate && (
                    <button
                      type="button"
                      className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        const values: Record<string, string> = {};
                        step.fields.forEach((f) => {
                          values[f.key] = draft[`${step.id}:${f.key}`] ?? f.value ?? "";
                        });
                        const res = completeStep(batch.id, step.id, values);
                        if (!res.ok) setError(res.error ?? "Failed");
                        else {
                          setError(null);
                          setMessage(
                            step.requiresSignoff
                              ? "Submitted — awaiting supervisor sign-off."
                              : "Step completed.",
                          );
                        }
                      }}
                    >
                      {step.requiresSignoff ? "Submit for sign-off" : "Complete step"}
                    </button>
                  )}
                  {(step.status === "awaiting_signoff" || step.status === "deviation") &&
                    canSign && (
                      <button
                        type="button"
                        className="rounded-lg bg-[var(--ok)] px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => {
                          const res = signOffStep(batch.id, step.id);
                          if (!res.ok) setError(res.error ?? "Failed");
                          else {
                            setError(null);
                            setMessage("Sign-off recorded.");
                          }
                        }}
                      >
                        Supervisor sign-off
                      </button>
                    )}
                </div>

                {(step.completedAt || step.signedOffAt) && (
                  <p className="mt-3 text-xs text-[var(--ink-muted)]">
                    {step.completedAt ? `Completed ${formatDateTime(step.completedAt)}` : ""}
                    {step.signedOffAt
                      ? ` · Signed off ${formatDateTime(step.signedOffAt)} by ${
                          users.find((u) => u.id === step.signedOffBy)?.name ?? "—"
                        }`
                      : ""}
                  </p>
                )}
              </Panel>
            );
          })}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Panel className="p-5">
            <h3 className="font-semibold">Production summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Machine" v={batch.machineId} />
              <Row k="Target qty" v={batch.targetQuantity.toLocaleString()} />
              <Row
                k="Produced"
                v={batch.quantityProduced?.toLocaleString() ?? "—"}
              />
              <Row k="Yield %" v={batch.yieldPercent != null ? `${batch.yieldPercent}%` : "—"} />
              <Row k="Active step" v={activeStep?.title ?? "—"} />
            </dl>
          </Panel>

          <Panel className="p-5">
            <h3 className="font-semibold">Materials issued</h3>
            {batch.materials.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--ink-muted)]">None logged yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {batch.materials.map((m) => (
                  <li key={m.lotNumber} className="rounded-md border border-[var(--line)] px-3 py-2">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-[var(--ink-muted)]">
                      Lot {m.lotNumber} · {m.quantity} {m.unit}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center gap-2">
              <span className="live-dot h-2 w-2 rounded-full bg-[var(--brand)]" />
              <h3 className="font-semibold">Audit trail</h3>
            </div>
            <ul className="mt-3 max-h-80 space-y-3 overflow-y-auto">
              {[...batch.auditTrail].reverse().map((a) => (
                <li key={a.id} className="border-l-2 border-[var(--brand-soft)] pl-3 text-sm">
                  <p className="font-medium">{a.action}</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {a.userName} · {formatDateTime(a.at)}
                  </p>
                  {a.detail ? <p className="text-xs text-[var(--ink-muted)]">{a.detail}</p> : null}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--ink-muted)]">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
