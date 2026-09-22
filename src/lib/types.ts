export type Role =
  | "operator"
  | "qc"
  | "warehouse"
  | "supervisor"
  | "hr"
  | "manager"
  | "compliance";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
};

export type AuditEntry = {
  id: string;
  at: string;
  userId: string;
  userName: string;
  action: string;
  detail?: string;
};

export type BatchStepStatus = "pending" | "in_progress" | "awaiting_signoff" | "completed" | "deviation";

export type BatchStep = {
  id: string;
  order: number;
  title: string;
  instruction: string;
  requiresSignoff: boolean;
  status: BatchStepStatus;
  fields: {
    key: string;
    label: string;
    type: "text" | "number" | "select" | "time";
    options?: string[];
    value?: string;
    standardMin?: number;
    standardMax?: number;
  }[];
  signedOffBy?: string;
  signedOffAt?: string;
  completedAt?: string;
  completedBy?: string;
  deviationNote?: string;
};

export type BatchStatus =
  | "draft"
  | "sop_pending"
  | "in_progress"
  | "awaiting_supervisor"
  | "submitted_qc"
  | "completed"
  | "rejected";

export type Batch = {
  id: string;
  batchNumber: string;
  productName: string;
  sopId: string;
  sopVersion: string;
  machineId: string;
  targetQuantity: number;
  quantityProduced?: number;
  yieldPercent?: number;
  status: BatchStatus;
  assignedTo: string;
  shift: string;
  createdAt: string;
  updatedAt: string;
  steps: BatchStep[];
  auditTrail: AuditEntry[];
  materials: {
    name: string;
    lotNumber: string;
    quantity: number;
    unit: string;
  }[];
};

export type Sop = {
  id: string;
  code: string;
  title: string;
  version: string;
  category: string;
  status: "current" | "archived";
  effectiveDate: string;
  summary: string;
  acknowledgmentsRequired: boolean;
};

export type SopAcknowledgment = {
  sopId: string;
  userId: string;
  date: string;
  version: string;
  at: string;
};

export type AttendanceRecord = {
  id: string;
  userId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  shift: string;
  status: "present" | "absent" | "on_leave" | "partial";
};

export type AppState = {
  currentUserId: string | null;
  batches: Batch[];
  sops: Sop[];
  acknowledgments: SopAcknowledgment[];
  attendance: AttendanceRecord[];
};
