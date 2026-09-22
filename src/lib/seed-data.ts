import type { AttendanceRecord, Batch, Sop, User } from "./types";

export const USERS: User[] = [
  {
    id: "u-op-1",
    name: "Ahmed Khan",
    email: "ahmed.khan@dpharma.local",
    role: "operator",
    department: "Production — Line A",
  },
  {
    id: "u-sup-1",
    name: "Sara Malik",
    email: "sara.malik@dpharma.local",
    role: "supervisor",
    department: "Production Floor",
  },
  {
    id: "u-qc-1",
    name: "Dr. Nadia Rehman",
    email: "nadia.rehman@dpharma.local",
    role: "qc",
    department: "Quality Control",
  },
  {
    id: "u-hr-1",
    name: "Bilal Hussain",
    email: "bilal.hussain@dpharma.local",
    role: "hr",
    department: "Human Resources",
  },
  {
    id: "u-mgr-1",
    name: "Fatima Sheikh",
    email: "fatima.sheikh@dpharma.local",
    role: "manager",
    department: "Plant Management",
  },
  {
    id: "u-comp-1",
    name: "Omar Farooq",
    email: "omar.farooq@dpharma.local",
    role: "compliance",
    department: "QA / Compliance",
  },
];

export const ROLE_LABELS: Record<User["role"], string> = {
  operator: "Production Operator",
  qc: "QC / QA Officer",
  warehouse: "Warehouse Staff",
  supervisor: "Shift Supervisor",
  hr: "HR / Admin",
  manager: "Plant Manager",
  compliance: "Compliance Officer",
};

const today = () => new Date().toISOString().slice(0, 10);

function makeBatchSteps(): Batch["steps"] {
  return [
    {
      id: "step-1",
      order: 1,
      title: "Line clearance & SOP confirm",
      instruction:
        "Verify previous batch cleared, equipment cleaned, and current SOP acknowledged for this shift.",
      requiresSignoff: true,
      status: "pending",
      fields: [
        {
          key: "area_cleared",
          label: "Area cleared",
          type: "select",
          options: ["Yes", "No"],
        },
        {
          key: "sop_version_confirmed",
          label: "SOP version confirmed",
          type: "select",
          options: ["Yes", "No"],
        },
      ],
    },
    {
      id: "step-2",
      order: 2,
      title: "Raw material issue",
      instruction:
        "Record materials issued against the BMR. Lot numbers must match warehouse issue tickets.",
      requiresSignoff: false,
      status: "pending",
      fields: [
        {
          key: "api_lot",
          label: "API lot number",
          type: "text",
        },
        {
          key: "api_qty",
          label: "API quantity (kg)",
          type: "number",
          standardMin: 48,
          standardMax: 52,
        },
        {
          key: "excipient_lot",
          label: "Excipient lot number",
          type: "text",
        },
      ],
    },
    {
      id: "step-3",
      order: 3,
      title: "Granulation / blending",
      instruction:
        "Run blending cycle per SOP. Record start/end times and equipment ID. Flag if duration outside standard.",
      requiresSignoff: true,
      status: "pending",
      fields: [
        {
          key: "machine_id",
          label: "Machine ID",
          type: "select",
          options: ["BL-01", "BL-02", "MX-04"],
        },
        {
          key: "start_time",
          label: "Start time",
          type: "time",
        },
        {
          key: "end_time",
          label: "End time",
          type: "time",
        },
        {
          key: "blend_rpm",
          label: "Blend RPM",
          type: "number",
          standardMin: 20,
          standardMax: 30,
        },
      ],
    },
    {
      id: "step-4",
      order: 4,
      title: "Compression / fill",
      instruction:
        "Record output quantity, rejects, and in-process checks. Yield calculated automatically.",
      requiresSignoff: true,
      status: "pending",
      fields: [
        {
          key: "qty_produced",
          label: "Quantity produced (units)",
          type: "number",
        },
        {
          key: "rejects",
          label: "Rejects (units)",
          type: "number",
        },
        {
          key: "avg_weight",
          label: "Avg tablet weight (mg)",
          type: "number",
          standardMin: 495,
          standardMax: 505,
        },
      ],
    },
    {
      id: "step-5",
      order: 5,
      title: "Batch close & submit",
      instruction:
        "Confirm packaging stage ready and submit batch for supervisor review, then QC sampling.",
      requiresSignoff: true,
      status: "pending",
      fields: [
        {
          key: "packaging_ready",
          label: "Ready for packaging hold",
          type: "select",
          options: ["Yes", "No"],
        },
        {
          key: "operator_notes",
          label: "Operator notes",
          type: "text",
        },
      ],
    },
  ];
}

export const SEED_SOPS: Sop[] = [
  {
    id: "sop-bmr-001",
    code: "SOP-PROD-014",
    title: "Paracetamol 500mg Tablet Manufacturing",
    version: "3.2",
    category: "Production",
    status: "current",
    effectiveDate: "2026-07-01",
    summary:
      "End-to-end manufacturing procedure for Paracetamol 500mg tablets including line clearance, blending, compression, and in-process controls.",
    acknowledgmentsRequired: true,
  },
  {
    id: "sop-bmr-002",
    code: "SOP-PROD-021",
    title: "Amoxicillin Capsule Fill Operation",
    version: "2.0",
    category: "Production",
    status: "current",
    effectiveDate: "2026-05-15",
    summary:
      "Capsule filling, weight variation checks, and environmental monitoring requirements for antibiotic line.",
    acknowledgmentsRequired: true,
  },
  {
    id: "sop-qa-008",
    code: "SOP-QA-008",
    title: "In-Process Quality Checks — Oral Solids",
    version: "4.1",
    category: "Quality",
    status: "current",
    effectiveDate: "2026-08-10",
    summary:
      "Sampling frequency, acceptance criteria, and documentation for oral solid dosage forms.",
    acknowledgmentsRequired: true,
  },
  {
    id: "sop-saf-003",
    code: "SOP-SAF-003",
    title: "Shift Handover & Safety Checklist",
    version: "1.5",
    category: "Safety",
    status: "current",
    effectiveDate: "2026-03-01",
    summary:
      "Mandatory safety and area handover checklist for every shift start on production floors.",
    acknowledgmentsRequired: true,
  },
  {
    id: "sop-old",
    code: "SOP-PROD-014",
    title: "Paracetamol 500mg Tablet Manufacturing",
    version: "3.1",
    category: "Production",
    status: "archived",
    effectiveDate: "2025-11-01",
    summary: "Superseded by version 3.2.",
    acknowledgmentsRequired: false,
  },
];

export const SEED_BATCHES: Batch[] = [
  {
    id: "batch-1",
    batchNumber: "BMR-2026-0918-A",
    productName: "Paracetamol 500mg Tablets",
    sopId: "sop-bmr-001",
    sopVersion: "3.2",
    machineId: "BL-01",
    targetQuantity: 100000,
    quantityProduced: 42000,
    yieldPercent: 98.2,
    status: "in_progress",
    assignedTo: "u-op-1",
    shift: "Morning A",
    createdAt: `${today()}T06:05:00.000Z`,
    updatedAt: `${today()}T09:40:00.000Z`,
    materials: [
      { name: "Paracetamol API", lotNumber: "API-8821", quantity: 50, unit: "kg" },
      { name: "Microcrystalline cellulose", lotNumber: "EXC-4410", quantity: 18, unit: "kg" },
    ],
    steps: (() => {
      const steps = makeBatchSteps();
      steps[0] = {
        ...steps[0],
        status: "completed",
        completedAt: `${today()}T06:20:00.000Z`,
        completedBy: "u-op-1",
        signedOffBy: "u-sup-1",
        signedOffAt: `${today()}T06:25:00.000Z`,
        fields: steps[0].fields.map((f) =>
          f.key === "area_cleared" || f.key === "sop_version_confirmed"
            ? { ...f, value: "Yes" }
            : f,
        ),
      };
      steps[1] = {
        ...steps[1],
        status: "completed",
        completedAt: `${today()}T07:10:00.000Z`,
        completedBy: "u-op-1",
        fields: steps[1].fields.map((f) => {
          if (f.key === "api_lot") return { ...f, value: "API-8821" };
          if (f.key === "api_qty") return { ...f, value: "50" };
          if (f.key === "excipient_lot") return { ...f, value: "EXC-4410" };
          return f;
        }),
      };
      steps[2] = {
        ...steps[2],
        status: "in_progress",
        fields: steps[2].fields.map((f) =>
          f.key === "machine_id" ? { ...f, value: "BL-01" } : f,
        ),
      };
      return steps;
    })(),
    auditTrail: [
      {
        id: "a1",
        at: `${today()}T06:05:00.000Z`,
        userId: "u-sup-1",
        userName: "Sara Malik",
        action: "Batch created",
        detail: "Assigned to Ahmed Khan — Morning A",
      },
      {
        id: "a2",
        at: `${today()}T06:20:00.000Z`,
        userId: "u-op-1",
        userName: "Ahmed Khan",
        action: "Step completed",
        detail: "Line clearance & SOP confirm",
      },
      {
        id: "a3",
        at: `${today()}T06:25:00.000Z`,
        userId: "u-sup-1",
        userName: "Sara Malik",
        action: "Supervisor sign-off",
        detail: "Step 1 approved",
      },
    ],
  },
  {
    id: "batch-2",
    batchNumber: "BMR-2026-0918-B",
    productName: "Amoxicillin 250mg Capsules",
    sopId: "sop-bmr-002",
    sopVersion: "2.0",
    machineId: "CF-03",
    targetQuantity: 50000,
    status: "sop_pending",
    assignedTo: "u-op-1",
    shift: "Morning A",
    createdAt: `${today()}T06:30:00.000Z`,
    updatedAt: `${today()}T06:30:00.000Z`,
    materials: [],
    steps: makeBatchSteps(),
    auditTrail: [
      {
        id: "b1",
        at: `${today()}T06:30:00.000Z`,
        userId: "u-sup-1",
        userName: "Sara Malik",
        action: "Batch created",
        detail: "Awaiting SOP acknowledgment before start",
      },
    ],
  },
  {
    id: "batch-3",
    batchNumber: "BMR-2026-0917-C",
    productName: "Paracetamol 500mg Tablets",
    sopId: "sop-bmr-001",
    sopVersion: "3.2",
    machineId: "BL-02",
    targetQuantity: 100000,
    quantityProduced: 98500,
    yieldPercent: 98.5,
    status: "awaiting_supervisor",
    assignedTo: "u-op-1",
    shift: "Evening B",
    createdAt: "2026-09-21T14:00:00.000Z",
    updatedAt: "2026-09-21T22:10:00.000Z",
    materials: [
      { name: "Paracetamol API", lotNumber: "API-8799", quantity: 50, unit: "kg" },
    ],
    steps: (() => {
      const steps = makeBatchSteps();
      return steps.map((s, i) => ({
        ...s,
        status: i < 4 ? ("completed" as const) : ("awaiting_signoff" as const),
        completedAt: i < 4 ? "2026-09-21T20:00:00.000Z" : undefined,
        completedBy: i < 4 ? "u-op-1" : undefined,
        signedOffBy: i < 4 && s.requiresSignoff ? "u-sup-1" : undefined,
        signedOffAt: i < 4 && s.requiresSignoff ? "2026-09-21T20:05:00.000Z" : undefined,
        fields: s.fields.map((f) => ({
          ...f,
          value:
            f.type === "select"
              ? f.options?.[0]
              : f.type === "number"
                ? String(f.standardMin ?? 1)
                : f.type === "time"
                  ? "14:00"
                  : "Logged",
        })),
      }));
    })(),
    auditTrail: [
      {
        id: "c1",
        at: "2026-09-21T22:10:00.000Z",
        userId: "u-op-1",
        userName: "Ahmed Khan",
        action: "Submitted for supervisor",
        detail: "Batch close pending sign-off",
      },
    ],
  },
];

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-seed-1",
    userId: "u-sup-1",
    date: today(),
    clockIn: `${today()}T05:55:00.000Z`,
    shift: "Morning A",
    status: "present",
  },
];

export function createEmptyBatch(partial: {
  productName: string;
  sopId: string;
  sopVersion: string;
  assignedTo: string;
  shift: string;
  createdBy: User;
}): Batch {
  const now = new Date().toISOString();
  const datePart = now.slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 90 + 10);
  return {
    id: `batch-${Date.now()}`,
    batchNumber: `BMR-${datePart}-${suffix}`,
    productName: partial.productName,
    sopId: partial.sopId,
    sopVersion: partial.sopVersion,
    machineId: "—",
    targetQuantity: 100000,
    status: "sop_pending",
    assignedTo: partial.assignedTo,
    shift: partial.shift,
    createdAt: now,
    updatedAt: now,
    materials: [],
    steps: makeBatchSteps(),
    auditTrail: [
      {
        id: `aud-${Date.now()}`,
        at: now,
        userId: partial.createdBy.id,
        userName: partial.createdBy.name,
        action: "Batch created",
        detail: `${partial.productName} — ${partial.shift}`,
      },
    ],
  };
}

export { makeBatchSteps };
