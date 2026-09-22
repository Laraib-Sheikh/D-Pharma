import type { BatchStatus, BatchStepStatus, Role } from "./types";
import { ROLE_LABELS } from "./seed-data";

export function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function roleLabel(role: Role) {
  return ROLE_LABELS[role];
}

export function batchStatusLabel(status: BatchStatus) {
  const map: Record<BatchStatus, string> = {
    draft: "Draft",
    sop_pending: "SOP pending",
    in_progress: "In progress",
    awaiting_supervisor: "Awaiting supervisor",
    submitted_qc: "Submitted to QC",
    completed: "Completed",
    rejected: "Rejected",
  };
  return map[status];
}

export function stepStatusLabel(status: BatchStepStatus) {
  const map: Record<BatchStepStatus, string> = {
    pending: "Pending",
    in_progress: "In progress",
    awaiting_signoff: "Awaiting sign-off",
    completed: "Completed",
    deviation: "Deviation",
  };
  return map[status];
}
