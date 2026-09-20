import Dexie, { type Table } from "dexie";

export interface UserSession {
  id?: number;
  reportId?: string;
  date: string;
  type: "yoga" | "physio" | "mobility";
  title: string;
  durationMinutes: number;
  exercisesCompleted: number;
  painScoreBefore?: number;
  painScoreAfter?: number;
  accuracyScore?: number;
  peakRom?: number;
  painInterrupted?: boolean;
}

export interface PainLog {
  id?: number;
  timestamp: string;
  area: string;
  score: number;
  notes?: string;
}

export interface OutboxReport {
  id?: number;
  reportId: string;
  payload: any;
  createdAt: number;
  retries: number;
  status: "pending" | "syncing" | "failed";
  lastAttemptAt?: number;
  errorMessage?: string;
}

export interface PatientProfileRecord {
  id: string; // "current"
  patientId: string;
  patientToken: string;
  clinicCode: string;
  clinicName?: string;
  joinedAt: string;
}

export interface CachedProgramRecord {
  patientId: string;
  programName: string;
  maxPainThreshold: number;
  targetRom?: number;
  reps?: number;
  guidanceNotes: string;
  updatedAt: string;
}

export class CalmMotionDB extends Dexie {
  sessions!: Table<UserSession>;
  painLogs!: Table<PainLog>;
  outbox!: Table<OutboxReport>;
  patientProfile!: Table<PatientProfileRecord, string>;
  cachedProgram!: Table<CachedProgramRecord, string>;

  constructor() {
    super("CalmMotionDB");
    this.version(3).stores({
      sessions: "++id, date, type, reportId",
      painLogs: "++id, timestamp, area, score",
      outbox: "++id, reportId, status, createdAt",
      patientProfile: "id",
      cachedProgram: "patientId",
    });
  }
}

export const db = new CalmMotionDB();

export async function getPatientIdentity(): Promise<PatientProfileRecord | null> {
  return (await db.patientProfile.get("current")) || null;
}

export async function savePatientIdentity(
  identity: Omit<PatientProfileRecord, "id">
): Promise<void> {
  await db.patientProfile.put({ ...identity, id: "current" });
}

export async function clearPatientIdentity(): Promise<void> {
  await db.patientProfile.delete("current");
}

