import { db, getPatientIdentity, CachedProgramRecord } from "./db";
import { PAIN_STOP_THRESHOLD } from "./constants";

export interface ActiveProgram {
  programName: string;
  maxPainThreshold: number;
  targetRom?: number;
  reps?: number;
  guidanceNotes: string;
  isCustomPrescription: boolean;
}

export const DEFAULT_PROGRAM: ActiveProgram = {
  programName: "General Mobility Guidance",
  maxPainThreshold: PAIN_STOP_THRESHOLD,
  guidanceNotes: "Maintain smooth, calm movement. Safety pauses if discomfort reaches the threshold.",
  isCustomPrescription: false,
};

/**
 * Fetch assigned clinical program from the therapist backend.
 * Falls back to offline Dexie cache when offline, or to clinical baseline defaults.
 */
export async function fetchProgram(): Promise<ActiveProgram> {
  const identity = await getPatientIdentity();

  if (!identity || !identity.patientToken) {
    // If not connected to a clinic, check if there is an offline cached program
    const cached = await db.cachedProgram.toCollection().first();
    if (cached) {
      return {
        programName: cached.programName,
        maxPainThreshold: cached.maxPainThreshold ?? PAIN_STOP_THRESHOLD,
        targetRom: cached.targetRom,
        reps: cached.reps,
        guidanceNotes: cached.guidanceNotes,
        isCustomPrescription: true,
      };
    }
    return DEFAULT_PROGRAM;
  }

  // Attempt live fetch if online
  if (typeof navigator === "undefined" || navigator.onLine) {
    try {
      const res = await fetch("/api/patient/program", {
        headers: {
          Authorization: `Bearer ${identity.patientToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.program) {
          const record: CachedProgramRecord = {
            patientId: identity.patientId,
            programName: data.program.programName,
            maxPainThreshold: data.program.maxPainThreshold ?? PAIN_STOP_THRESHOLD,
            targetRom: data.program.targetRom,
            reps: data.program.reps,
            guidanceNotes: data.program.guidanceNotes,
            updatedAt: data.program.updatedAt || new Date().toISOString(),
          };
          await db.cachedProgram.put(record);
          return {
            programName: record.programName,
            maxPainThreshold: record.maxPainThreshold,
            targetRom: record.targetRom,
            reps: record.reps,
            guidanceNotes: record.guidanceNotes,
            isCustomPrescription: true,
          };
        }
      }
    } catch {
      // Network failure: fall back to offline cache
    }
  }

  // Read from offline cache
  const cached = await db.cachedProgram.get(identity.patientId);
  if (cached) {
    return {
      programName: cached.programName,
      maxPainThreshold: cached.maxPainThreshold ?? PAIN_STOP_THRESHOLD,
      targetRom: cached.targetRom,
      reps: cached.reps,
      guidanceNotes: cached.guidanceNotes,
      isCustomPrescription: true,
    };
  }

  return DEFAULT_PROGRAM;
}

