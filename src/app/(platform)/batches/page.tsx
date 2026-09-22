"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { BatchStatusBadge, PageHeader, Panel } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { usePlatform } from "@/lib/store";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function BatchesPage() {
  const router = useRouter();
  const { user, users, batches, sops, createBatch } = usePlatform();
  const [showNew, setShowNew] = useState(false);
  const [productName, setProductName] = useState("Paracetamol 500mg Tablets");
  const [sopId, setSopId] = useState("sop-bmr-001");
  const [assignedTo, setAssignedTo] = useState("u-op-1");
  const [shift, setShift] = useState("Morning A");
  const [filter, setFilter] = useState("all");

  const currentSops = useMemo(
    () => sops.filter((s) => s.status === "current" && s.category === "Production"),
    [sops],
  );
  const operators = users.filter((u) => u.role === "operator" || u.role === "supervisor");
  const canCreate = user && (user.role === "supervisor" || user.role === "manager");

  const visible = batches.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (!user) return false;
    if (["supervisor", "manager", "qc", "compliance"].includes(user.role)) return true;
    return b.assignedTo === user.id;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Module 3.1"
        title="Digital batch records"
        description="Guided BMR forms with mandatory checkpoints, deviation flags, and a full audit trail."
        actions={
          canCreate ? (
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
            >
              {showNew ? "Cancel" : "New batch"}
            </button>
          ) : null
        }
      />

      {showNew && canCreate ? (
        <Panel className="animate-rise mb-6 p-5">
          <h2 className="text-lg font-semibold">Create batch assignment</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Product">
              <input
                className={fieldClass}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </Field>
            <Field label="SOP">
              <select className={fieldClass} value={sopId} onChange={(e) => setSopId(e.target.value)}>
                {currentSops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} v{s.version} — {s.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assign operator">
              <select
                className={fieldClass}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                {operators.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Shift">
              <select className={fieldClass} value={shift} onChange={(e) => setShift(e.target.value)}>
                <option>Morning A</option>
                <option>Evening B</option>
                <option>Night C</option>
              </select>
            </Field>
          </div>
          <button
            type="button"
            className="mt-4 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
            onClick={() => {
              const batch = createBatch({ productName, sopId, assignedTo, shift });
              if (batch) {
                setShowNew(false);
                router.push(`/batches/${batch.id}`);
              }
            }}
          >
            Create & open BMR
          </button>
        </Panel>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["in_progress", "In progress"],
          ["sop_pending", "SOP pending"],
          ["awaiting_supervisor", "Awaiting supervisor"],
          ["submitted_qc", "Submitted to QC"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              filter === value
                ? "bg-[var(--brand)] text-white"
                : "border border-[var(--line)] bg-white text-[var(--ink-muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Panel className="animate-rise overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[#f0f5f7] text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            <tr>
              <th className="px-5 py-3 font-semibold">Batch</th>
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Shift</th>
              <th className="px-5 py-3 font-semibold">Updated</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {visible.map((b) => {
              const assignee = users.find((u) => u.id === b.assignedTo);
              return (
                <tr key={b.id} className="hover:bg-[var(--brand-soft)]/30">
                  <td className="px-5 py-3.5">
                    <Link href={`/batches/${b.id}`} className="font-semibold text-[var(--brand)]">
                      {b.batchNumber}
                    </Link>
                    <p className="text-xs text-[var(--ink-muted)]">{assignee?.name}</p>
                  </td>
                  <td className="px-5 py-3.5">{b.productName}</td>
                  <td className="px-5 py-3.5">{b.shift}</td>
                  <td className="px-5 py-3.5 text-[var(--ink-muted)]">
                    {formatDateTime(b.updatedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <BatchStatusBadge status={b.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[var(--ink)]">
      {label}
      {children}
    </label>
  );
}
