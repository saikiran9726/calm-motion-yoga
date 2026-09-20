export interface SyncReportPayload {
  reportId: string;
  patientId: string;
  patientName: string;
  clinicCode?: string;
  date: string;
  exerciseTitle: string;
  repsCompleted: number;
  targetReps: number;
  durationSeconds: number;
  formQuality: "Excellent" | "Good" | "Needs Attention";
  peakRom?: number;
  painBefore: number;
  painAfter: number;
  painInterrupted: boolean;
  timestamp?: number;
  mode?: "hold" | "reps";
  painThreshold?: number;
}

/**
 * Builds a clean, whitelisted sync payload containing strictly the fields
 * accepted by the server's SessionReportSchema.
 * Omits client-only properties like accuracyScore and simulated.
 */
export function buildSyncPayload(
  reportData: any,
  identity?: { patientId?: string; clinicCode?: string; patientName?: string } | null
): SyncReportPayload {
  const payload: SyncReportPayload = {
    reportId: String(reportData.reportId || ""),
    patientId: String(identity?.patientId || reportData.patientId || ""),
    patientName: String(reportData.patientName || "Patient"),
    date: String(reportData.date || new Date().toISOString()),
    exerciseTitle: String(reportData.exerciseTitle || "Movement Session"),
    repsCompleted: Number(reportData.repsCompleted ?? 0),
    targetReps: Number(reportData.targetReps ?? 10),
    durationSeconds: Number(reportData.durationSeconds ?? 0),
    formQuality: (["Excellent", "Good", "Needs Attention"].includes(reportData.formQuality)
      ? reportData.formQuality
      : "Good") as "Excellent" | "Good" | "Needs Attention",
    painBefore: Number(reportData.painBefore ?? 0),
    painAfter: Number(reportData.painAfter ?? 0),
    painInterrupted: Boolean(reportData.painInterrupted),
  };

  const clinicCode = identity?.clinicCode || reportData.clinicCode;
  if (clinicCode) {
    payload.clinicCode = String(clinicCode).toUpperCase();
  }

  if (typeof reportData.peakRom === "number") {
    payload.peakRom = reportData.peakRom;
  }

  if (reportData.timestamp) {
    payload.timestamp = Number(reportData.timestamp);
  }

  if (reportData.mode === "hold" || reportData.mode === "reps") {
    payload.mode = reportData.mode;
  }

  if (typeof reportData.painThreshold === "number") {
    payload.painThreshold = Number(reportData.painThreshold);
  }

  return payload;
}
