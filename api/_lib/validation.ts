import { z } from "zod";

export const ClinicAuthSchema = z
  .object({
    clinicCode: z
      .string()
      .trim()
      .min(3)
      .max(12)
      .regex(/^[A-Za-z0-9_-]+$/, "Clinic code must be alphanumeric")
      .transform((v) => v.toUpperCase()),
    passcode: z.string().min(4).max(100),
    name: z.string().trim().max(100).optional(),
  })
  .strict();

export const PatientJoinSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    clinicCode: z
      .string()
      .trim()
      .min(3)
      .max(12)
      .regex(/^[A-Za-z0-9_-]+$/, "Clinic code must be alphanumeric")
      .transform((v) => v.toUpperCase()),
    condition: z.string().trim().max(200).optional(),
  })
  .strict();

export const SessionReportSchema = z
  .object({
    reportId: z.string().trim().min(1).max(100),
    patientId: z.string().trim().min(1).max(100),
    patientName: z.string().trim().min(1).max(100),
    clinicCode: z.string().trim().min(3).max(12).transform((v) => v.toUpperCase()).optional(),
    date: z.string().trim().max(100),
    exerciseTitle: z.string().trim().max(100),
    repsCompleted: z.number().int().min(0).max(1000),
    targetReps: z.number().int().min(1).max(1000),
    durationSeconds: z.number().int().min(0).max(86400),
    formQuality: z.enum(["Excellent", "Good", "Needs Attention"]),
    peakRom: z.number().min(0).max(360).optional().default(0),
    painBefore: z.number().int().min(0).max(10),
    painAfter: z.number().int().min(0).max(10),
    painInterrupted: z.boolean().optional().default(false),
    timestamp: z.number().int().optional(),
    mode: z.enum(["hold", "reps"]).optional(),
  })
  .strict();

export const ProgramUpdateSchema = z
  .object({
    patientId: z.string().trim().min(1).max(100),
    clinicCode: z.string().trim().min(3).max(12).transform((v) => v.toUpperCase()).optional(),
    programName: z.string().trim().min(1).max(100),
    maxPainThreshold: z.number().int().min(0).max(10),
    targetRom: z.number().min(0).max(360).optional(),
    reps: z.number().int().min(1).max(1000).optional(),
    guidanceNotes: z.string().trim().min(1).max(2000),
  })
  .strict();

export const NoteCreateSchema = z
  .object({
    patientId: z.string().trim().min(1).max(100),
    clinicCode: z.string().trim().min(3).max(12).transform((v) => v.toUpperCase()).optional(),
    therapistName: z.string().trim().max(100).optional().default("Dr. Anita Desai, PT"),
    content: z.string().trim().min(1).max(5000),
  })
  .strict();

export const DeleteDataSchema = z
  .object({
    patientId: z.string().trim().min(1).max(100),
    clinicCode: z.string().optional(),
  })
  .strict();

export const PatientIdQuerySchema = z
  .object({
    patientId: z.string().trim().min(1).max(100),
  });

