import { z } from 'zod';

export const ClinicAuthSchema = z.object({
  clinicCode: z.string().min(4).max(8).transform((v) => v.toUpperCase()),
  passcode: z.string().min(4),
  name: z.string().optional(),
});

export const PatientJoinSchema = z.object({
  patientId: z.string().min(1),
  name: z.string().min(1),
  clinicCode: z.string().min(4).max(8).transform((v) => v.toUpperCase()),
  condition: z.string().optional(),
});

export const SessionReportSchema = z.object({
  reportId: z.string().min(1), // Idempotency key
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  clinicCode: z.string().min(4).max(8).transform((v) => v.toUpperCase()),
  date: z.string(),
  exerciseTitle: z.string(),
  repsCompleted: z.number().nonnegative(),
  targetReps: z.number().positive(),
  durationSeconds: z.number().nonnegative(),
  formQuality: z.enum(['Excellent', 'Good', 'Needs Attention']),
  peakRom: z.number().optional().default(0),
  painBefore: z.number().min(0).max(10),
  painAfter: z.number().min(0).max(10),
  painInterrupted: z.boolean().optional().default(false),
  timestamp: z.number().optional(),
});

export const ProgramUpdateSchema = z.object({
  patientId: z.string().min(1),
  clinicCode: z.string().min(4).max(8).transform((v) => v.toUpperCase()),
  programName: z.string().min(1),
  maxPainThreshold: z.number().min(0).max(10),
  targetRom: z.number().optional(),
  reps: z.number().positive().optional(),
  guidanceNotes: z.string().min(1),
});

export const NoteCreateSchema = z.object({
  patientId: z.string().min(1),
  clinicCode: z.string().min(4).max(8).transform((v) => v.toUpperCase()),
  therapistName: z.string().default('Dr. Anita Desai, PT'),
  content: z.string().min(1),
});

export const DeleteDataSchema = z.object({
  patientId: z.string().min(1),
  clinicCode: z.string().optional(),
});
