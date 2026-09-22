"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createEmptyBatch, SEED_ATTENDANCE, SEED_BATCHES, SEED_SOPS, USERS } from "./seed-data";
import type {
  AppState,
  AttendanceRecord,
  Batch,
  BatchStep,
  SopAcknowledgment,
  User,
} from "./types";

const STORAGE_KEY = "dpharma-web-state-v1";

type PlatformContextValue = {
  ready: boolean;
  user: User | null;
  users: User[];
  batches: Batch[];
  sops: typeof SEED_SOPS;
  acknowledgments: SopAcknowledgment[];
  attendance: AttendanceRecord[];
  login: (userId: string) => void;
  logout: () => void;
  acknowledgeSop: (sopId: string) => void;
  hasAcknowledgedToday: (sopId: string, userId?: string) => boolean;
  clockIn: (shift: string) => void;
  clockOut: () => void;
  todayAttendance: AttendanceRecord | null;
  createBatch: (input: {
    productName: string;
    sopId: string;
    assignedTo: string;
    shift: string;
  }) => Batch | null;
  updateStepFields: (batchId: string, stepId: string, values: Record<string, string>) => void;
  completeStep: (
    batchId: string,
    stepId: string,
    values?: Record<string, string>,
  ) => { ok: boolean; error?: string };
  signOffStep: (batchId: string, stepId: string) => { ok: boolean; error?: string };
  startBatch: (batchId: string) => { ok: boolean; error?: string };
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState(): AppState {
  if (typeof window === "undefined") {
    return {
      currentUserId: null,
      batches: SEED_BATCHES,
      sops: SEED_SOPS,
      acknowledgments: [],
      attendance: SEED_ATTENDANCE,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        currentUserId: null,
        batches: SEED_BATCHES,
        sops: SEED_SOPS,
        acknowledgments: [],
        attendance: SEED_ATTENDANCE,
      };
    }
    const parsed = JSON.parse(raw) as AppState;
    return {
      currentUserId: parsed.currentUserId ?? null,
      batches: parsed.batches?.length ? parsed.batches : SEED_BATCHES,
      sops: parsed.sops?.length ? parsed.sops : SEED_SOPS,
      acknowledgments: parsed.acknowledgments ?? [],
      attendance: parsed.attendance?.length ? parsed.attendance : SEED_ATTENDANCE,
    };
  } catch {
    return {
      currentUserId: null,
      batches: SEED_BATCHES,
      sops: SEED_SOPS,
      acknowledgments: [],
      attendance: SEED_ATTENDANCE,
    };
  }
}

function stepHasDeviation(step: BatchStep): boolean {
  return step.fields.some((f) => {
    if (f.type !== "number" || f.value == null || f.value === "") return false;
    const n = Number(f.value);
    if (Number.isNaN(n)) return false;
    if (f.standardMin != null && n < f.standardMin) return true;
    if (f.standardMax != null && n > f.standardMax) return true;
    return false;
  });
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(() => ({
    currentUserId: null,
    batches: SEED_BATCHES,
    sops: SEED_SOPS,
    acknowledgments: [],
    attendance: SEED_ATTENDANCE,
  }));

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const user = useMemo(
    () => USERS.find((u) => u.id === state.currentUserId) ?? null,
    [state.currentUserId],
  );

  const login = useCallback((userId: string) => {
    setState((s) => ({ ...s, currentUserId: userId }));
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUserId: null }));
  }, []);

  const hasAcknowledgedToday = useCallback(
    (sopId: string, userId?: string) => {
      const uid = userId ?? state.currentUserId;
      if (!uid) return false;
      const sop = state.sops.find((x) => x.id === sopId);
      if (!sop) return false;
      return state.acknowledgments.some(
        (a) =>
          a.sopId === sopId &&
          a.userId === uid &&
          a.date === todayKey() &&
          a.version === sop.version,
      );
    },
    [state.acknowledgments, state.currentUserId, state.sops],
  );

  const acknowledgeSop = useCallback(
    (sopId: string) => {
      if (!user) return;
      const sop = state.sops.find((x) => x.id === sopId);
      if (!sop || sop.status !== "current") return;
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        acknowledgments: [
          ...s.acknowledgments.filter(
            (a) => !(a.sopId === sopId && a.userId === user.id && a.date === todayKey()),
          ),
          {
            sopId,
            userId: user.id,
            date: todayKey(),
            version: sop.version,
            at: now,
          },
        ],
      }));
    },
    [state.sops, user],
  );

  const todayAttendance = useMemo(() => {
    if (!user) return null;
    return (
      state.attendance.find((a) => a.userId === user.id && a.date === todayKey()) ?? null
    );
  }, [state.attendance, user]);

  const clockIn = useCallback(
    (shift: string) => {
      if (!user) return;
      const now = new Date().toISOString();
      setState((s) => {
        const existing = s.attendance.find(
          (a) => a.userId === user.id && a.date === todayKey(),
        );
        if (existing?.clockIn) return s;
        const next: AttendanceRecord = existing
          ? { ...existing, clockIn: now, shift, status: "present" }
          : {
              id: `att-${Date.now()}`,
              userId: user.id,
              date: todayKey(),
              clockIn: now,
              shift,
              status: "present",
            };
        return {
          ...s,
          attendance: [
            ...s.attendance.filter((a) => !(a.userId === user.id && a.date === todayKey())),
            next,
          ],
        };
      });
    },
    [user],
  );

  const clockOut = useCallback(() => {
    if (!user) return;
    const now = new Date().toISOString();
    setState((s) => ({
      ...s,
      attendance: s.attendance.map((a) =>
        a.userId === user.id && a.date === todayKey() && a.clockIn && !a.clockOut
          ? { ...a, clockOut: now, status: "present" }
          : a,
      ),
    }));
  }, [user]);

  const createBatch = useCallback(
    (input: {
      productName: string;
      sopId: string;
      assignedTo: string;
      shift: string;
    }) => {
      if (!user) return null;
      const sop = state.sops.find((x) => x.id === input.sopId);
      if (!sop) return null;
      const batch = createEmptyBatch({
        ...input,
        sopVersion: sop.version,
        createdBy: user,
      });
      setState((s) => ({ ...s, batches: [batch, ...s.batches] }));
      return batch;
    },
    [state.sops, user],
  );

  const startBatch = useCallback(
    (batchId: string) => {
      if (!user) return { ok: false, error: "Not signed in" };
      const batch = state.batches.find((b) => b.id === batchId);
      if (!batch) return { ok: false, error: "Batch not found" };
      if (!hasAcknowledgedToday(batch.sopId, user.id)) {
        return {
          ok: false,
          error: "Acknowledge the current SOP for this product before starting work.",
        };
      }
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        batches: s.batches.map((b) => {
          if (b.id !== batchId) return b;
          const steps = b.steps.map((step, i) =>
            i === 0 && step.status === "pending"
              ? { ...step, status: "in_progress" as const }
              : step,
          );
          return {
            ...b,
            status: "in_progress" as const,
            updatedAt: now,
            steps,
            auditTrail: [
              ...b.auditTrail,
              {
                id: `aud-${Date.now()}`,
                at: now,
                userId: user.id,
                userName: user.name,
                action: "Batch started",
                detail: `SOP ${b.sopVersion} acknowledged`,
              },
            ],
          };
        }),
      }));
      return { ok: true };
    },
    [hasAcknowledgedToday, state.batches, user],
  );

  const updateStepFields = useCallback(
    (batchId: string, stepId: string, values: Record<string, string>) => {
      if (!user) return;
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        batches: s.batches.map((b) => {
          if (b.id !== batchId) return b;
          return {
            ...b,
            updatedAt: now,
            steps: b.steps.map((step) => {
              if (step.id !== stepId) return step;
              return {
                ...step,
                fields: step.fields.map((f) =>
                  values[f.key] !== undefined ? { ...f, value: values[f.key] } : f,
                ),
              };
            }),
          };
        }),
      }));
    },
    [user],
  );

  const completeStep = useCallback(
    (batchId: string, stepId: string, values?: Record<string, string>) => {
      if (!user) return { ok: false, error: "Not signed in" };
      const batch = state.batches.find((b) => b.id === batchId);
      if (!batch) return { ok: false, error: "Batch not found" };
      if (batch.assignedTo !== user.id && user.role !== "supervisor" && user.role !== "manager") {
        return { ok: false, error: "Only the assigned operator can complete this step." };
      }
      const stepRaw = batch.steps.find((x) => x.id === stepId);
      if (!stepRaw) return { ok: false, error: "Step not found" };
      const step: BatchStep = {
        ...stepRaw,
        fields: stepRaw.fields.map((f) =>
          values && values[f.key] !== undefined ? { ...f, value: values[f.key] } : f,
        ),
      };
      const missing = step.fields.filter((f) => !f.value?.trim());
      if (missing.length) {
        return { ok: false, error: `Fill required fields: ${missing.map((m) => m.label).join(", ")}` };
      }

      const now = new Date().toISOString();
      const deviation = stepHasDeviation(step);

      setState((s) => ({
        ...s,
        batches: s.batches.map((b) => {
          if (b.id !== batchId) return b;
          const nextSteps = b.steps.map((st) => {
            if (st.id !== stepId) return st;
            const withValues: BatchStep = {
              ...st,
              fields: step.fields,
              completedAt: now,
              completedBy: user.id,
              deviationNote: deviation
                ? st.requiresSignoff
                  ? "Value outside standard parameter range — supervisor review required"
                  : "Value outside standard parameter range"
                : undefined,
              status: st.requiresSignoff
                ? deviation
                  ? "deviation"
                  : "awaiting_signoff"
                : deviation
                  ? "deviation"
                  : "completed",
            };
            return withValues;
          });

          const idx = nextSteps.findIndex((st) => st.id === stepId);
          const current = nextSteps[idx];
          if (current?.status === "completed" && nextSteps[idx + 1]?.status === "pending") {
            nextSteps[idx + 1] = { ...nextSteps[idx + 1], status: "in_progress" };
          }

          let qty = b.quantityProduced;
          let yieldPercent = b.yieldPercent;
          if (stepId === "step-4") {
            const produced = Number(current?.fields.find((f) => f.key === "qty_produced")?.value);
            const rejects = Number(current?.fields.find((f) => f.key === "rejects")?.value ?? 0);
            if (!Number.isNaN(produced)) {
              qty = produced;
              const good = produced - (Number.isNaN(rejects) ? 0 : rejects);
              yieldPercent = b.targetQuantity
                ? Math.round((good / b.targetQuantity) * 1000) / 10
                : undefined;
            }
          }

          const allDone = nextSteps.every((st) => st.status === "completed");
          const awaiting = nextSteps.some(
            (st) => st.status === "awaiting_signoff" || st.status === "deviation",
          );

          return {
            ...b,
            quantityProduced: qty,
            yieldPercent,
            status: allDone
              ? ("awaiting_supervisor" as const)
              : awaiting
                ? ("awaiting_supervisor" as const)
                : ("in_progress" as const),
            updatedAt: now,
            steps: nextSteps,
            auditTrail: [
              ...b.auditTrail,
              {
                id: `aud-${Date.now()}`,
                at: now,
                userId: user.id,
                userName: user.name,
                action: deviation ? "Step submitted with deviation" : "Step completed",
                detail: step.title,
              },
            ],
          };
        }),
      }));
      return { ok: true };
    },
    [state.batches, user],
  );

  const signOffStep = useCallback(
    (batchId: string, stepId: string) => {
      if (!user) return { ok: false, error: "Not signed in" };
      if (user.role !== "supervisor" && user.role !== "manager") {
        return { ok: false, error: "Only supervisors or managers can sign off." };
      }
      const batch = state.batches.find((b) => b.id === batchId);
      if (!batch) return { ok: false, error: "Batch not found" };
      if (batch.assignedTo === user.id) {
        return { ok: false, error: "You cannot approve your own batch." };
      }
      const step = batch.steps.find((x) => x.id === stepId);
      if (!step) return { ok: false, error: "Step not found" };
      if (step.status !== "awaiting_signoff" && step.status !== "deviation") {
        return { ok: false, error: "Step is not awaiting sign-off." };
      }

      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        batches: s.batches.map((b) => {
          if (b.id !== batchId) return b;
          const nextSteps = b.steps.map((st) => {
            if (st.id !== stepId) return st;
            return {
              ...st,
              status: "completed" as const,
              signedOffBy: user.id,
              signedOffAt: now,
            };
          });
          const idx = nextSteps.findIndex((st) => st.id === stepId);
          if (nextSteps[idx + 1]?.status === "pending") {
            nextSteps[idx + 1] = { ...nextSteps[idx + 1], status: "in_progress" };
          }
          const allDone = nextSteps.every((st) => st.status === "completed");
          return {
            ...b,
            status: allDone ? ("submitted_qc" as const) : ("in_progress" as const),
            updatedAt: now,
            steps: nextSteps,
            auditTrail: [
              ...b.auditTrail,
              {
                id: `aud-${Date.now()}`,
                at: now,
                userId: user.id,
                userName: user.name,
                action: "Supervisor sign-off",
                detail: step.title,
              },
            ],
          };
        }),
      }));
      return { ok: true };
    },
    [state.batches, user],
  );

  const value: PlatformContextValue = {
    ready,
    user,
    users: USERS,
    batches: state.batches,
    sops: state.sops,
    acknowledgments: state.acknowledgments,
    attendance: state.attendance,
    login,
    logout,
    acknowledgeSop,
    hasAcknowledgedToday,
    clockIn,
    clockOut,
    todayAttendance,
    createBatch,
    updateStepFields,
    completeStep,
    signOffStep,
    startBatch,
  };

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}
