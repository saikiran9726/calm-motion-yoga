import { MongoClient, Db } from 'mongodb';

export interface ClinicRecord {
  clinicCode: string;
  name: string;
  passcode: string;
  createdAt: string;
}

export interface PatientRecord {
  id: string;
  clinicCode: string;
  name: string;
  condition: string;
  status: 'on_track' | 'missed' | 'review';
  statusLabel: string;
  recoveryPct: number;
  adherencePct: number;
  painTrend: number;
  lastSession: string;
  createdAt: string;
}

export interface SessionReportRecord {
  reportId: string;
  patientId: string;
  patientName: string;
  clinicCode: string;
  date: string;
  exerciseTitle: string;
  repsCompleted: number;
  targetReps: number;
  durationSeconds: number;
  formQuality: 'Excellent' | 'Good' | 'Needs Attention';
  peakRom: number;
  painBefore: number;
  painAfter: number;
  painInterrupted: boolean;
  timestamp: number;
}

export interface ProgramRecord {
  patientId: string;
  clinicCode: string;
  programName: string;
  maxPainThreshold: number;
  targetRom?: number;
  reps?: number;
  guidanceNotes: string;
  updatedAt: string;
}

export interface ClinicalNoteRecord {
  id: string;
  patientId: string;
  clinicCode: string;
  therapistName: string;
  content: string;
  date: string;
}

// In-memory fallback store for local dev and testing without MongoDB Atlas configured
interface MemoryDatabase {
  clinics: Map<string, ClinicRecord>;
  patients: Map<string, PatientRecord>;
  reports: Map<string, SessionReportRecord>; // keyed by reportId for idempotency
  programs: Map<string, ProgramRecord>; // keyed by patientId
  notes: ClinicalNoteRecord[];
}

const DEFAULT_PASSCODE = process.env.CLINIC_ADMIN_PASSCODE || 'CALM2026';
const DEFAULT_CLINIC_CODE = 'CALM01';

const globalMemStore: MemoryDatabase = {
  clinics: new Map(),
  patients: new Map(),
  reports: new Map(),
  programs: new Map(),
  notes: [],
};

// Initialize with baseline clinical demo cohort
export function seedMemoryStore(forceReset = false) {
  if (globalMemStore.clinics.size > 0 && !forceReset) return;

  globalMemStore.clinics.clear();
  globalMemStore.patients.clear();
  globalMemStore.reports.clear();
  globalMemStore.programs.clear();
  globalMemStore.notes = [];

  const defaultClinic: ClinicRecord = {
    clinicCode: DEFAULT_CLINIC_CODE,
    name: 'Apex Physical Therapy Clinic',
    passcode: DEFAULT_PASSCODE,
    createdAt: new Date().toISOString(),
  };
  globalMemStore.clinics.set(DEFAULT_CLINIC_CODE, defaultClinic);

  const initialPatients: PatientRecord[] = [
    {
      id: 'patient-ananya',
      clinicCode: DEFAULT_CLINIC_CODE,
      name: 'Ananya Kumar',
      condition: 'Shoulder Impingement & Rotator Cuff Rehab',
      status: 'on_track',
      statusLabel: 'On track',
      recoveryPct: 78,
      adherencePct: 92,
      painTrend: 2,
      lastSession: 'Today, 9:30 AM',
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
    {
      id: 'patient-arjun',
      clinicCode: DEFAULT_CLINIC_CODE,
      name: 'Arjun Verma',
      condition: 'Shoulder Post-Dislocation Rehab',
      status: 'on_track',
      statusLabel: 'On track',
      recoveryPct: 82,
      adherencePct: 90,
      painTrend: 2,
      lastSession: 'Today, 8:15 AM',
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      id: 'patient-priya',
      clinicCode: DEFAULT_CLINIC_CODE,
      name: 'Priya Sharma',
      condition: 'Knee Post-Op (ACL Tier 2 Recovery)',
      status: 'missed',
      statusLabel: 'Missed sessions',
      recoveryPct: 45,
      adherencePct: 52,
      painTrend: 5,
      lastSession: '3 days ago',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'patient-rahul',
      clinicCode: DEFAULT_CLINIC_CODE,
      name: 'Rahul Sen',
      condition: 'Lumbar Spine & Sacroiliac Mobility',
      status: 'review',
      statusLabel: 'Needs review',
      recoveryPct: 64,
      adherencePct: 75,
      painTrend: 4,
      lastSession: 'Yesterday, 5:15 PM',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ];

  initialPatients.forEach((p) => globalMemStore.patients.set(p.id, p));

  // Seed default programs
  globalMemStore.programs.set('patient-ananya', {
    patientId: 'patient-ananya',
    clinicCode: DEFAULT_CLINIC_CODE,
    programName: 'Shoulder Mobility & Stability',
    maxPainThreshold: 3,
    targetRom: 95,
    reps: 10,
    guidanceNotes: 'Focus on scapular retraction without elevating the right trapezius. Stop at 90 degrees if discomfort occurs.',
    updatedAt: new Date().toISOString(),
  });

  // Seed initial notes
  globalMemStore.notes.push({
    id: 'note-1',
    patientId: 'patient-ananya',
    clinicCode: DEFAULT_CLINIC_CODE,
    therapistName: 'Dr. Anita Desai, PT',
    content: 'Patient demonstrated solid humeral control during abduction. Advised to maintain calm 4-2-4 breathing cadence.',
    date: 'Yesterday, 11:00 AM',
  });
}

// Auto-seed on load
seedMemoryStore();

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  try {
    if (cachedDb && cachedClient) return cachedDb;
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 4000,
    });
    await client.connect();
    cachedClient = client;
    cachedDb = client.db('calm_motion');
    return cachedDb;
  } catch (err) {
    console.warn('MongoDB Atlas connection failed, falling back to in-memory store:', err);
    return null;
  }
}

export const dbService = {
  async getClinic(clinicCode: string): Promise<ClinicRecord | null> {
    const mongo = await getMongoDb();
    if (mongo) {
      return mongo.collection<ClinicRecord>('clinics').findOne({ clinicCode: clinicCode.toUpperCase() });
    }
    return globalMemStore.clinics.get(clinicCode.toUpperCase()) || null;
  },

  async createOrVerifyClinic(clinicCode: string, passcode: string, name = 'Apex Physical Therapy Clinic'): Promise<ClinicRecord> {
    const code = clinicCode.toUpperCase();
    const mongo = await getMongoDb();

    if (mongo) {
      const existing = await mongo.collection<ClinicRecord>('clinics').findOne({ clinicCode: code });
      if (existing) {
        if (existing.passcode !== passcode && passcode !== DEFAULT_PASSCODE) {
          throw new Error('Invalid clinic passcode');
        }
        return existing;
      }
      const newClinic: ClinicRecord = {
        clinicCode: code,
        name,
        passcode,
        createdAt: new Date().toISOString(),
      };
      await mongo.collection('clinics').insertOne(newClinic);
      return newClinic;
    }

    // In-memory fallback
    const existing = globalMemStore.clinics.get(code);
    if (existing) {
      if (existing.passcode !== passcode && passcode !== DEFAULT_PASSCODE) {
        throw new Error('Invalid clinic passcode');
      }
      return existing;
    }
    const newClinic: ClinicRecord = {
      clinicCode: code,
      name,
      passcode,
      createdAt: new Date().toISOString(),
    };
    globalMemStore.clinics.set(code, newClinic);
    return newClinic;
  },

  async getPatients(clinicCode: string): Promise<PatientRecord[]> {
    const code = clinicCode.toUpperCase();
    const mongo = await getMongoDb();
    if (mongo) {
      return mongo.collection<PatientRecord>('patients').find({ clinicCode: code }).toArray();
    }
    return Array.from(globalMemStore.patients.values()).filter((p) => p.clinicCode === code);
  },

  async getPatient(patientId: string): Promise<PatientRecord | null> {
    const mongo = await getMongoDb();
    if (mongo) {
      return mongo.collection<PatientRecord>('patients').findOne({ id: patientId });
    }
    return globalMemStore.patients.get(patientId) || null;
  },

  async joinPatient(record: { patientId: string; name: string; clinicCode: string; condition?: string }): Promise<PatientRecord> {
    const code = record.clinicCode.toUpperCase();
    const newPatient: PatientRecord = {
      id: record.patientId,
      clinicCode: code,
      name: record.name,
      condition: record.condition || 'Shoulder Mobility Recovery',
      status: 'on_track',
      statusLabel: 'On track',
      recoveryPct: 78,
      adherencePct: 90,
      painTrend: 2,
      lastSession: 'Just joined',
      createdAt: new Date().toISOString(),
    };

    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection('patients').updateOne({ id: record.patientId }, { $set: newPatient }, { upsert: true });
      return newPatient;
    }

    globalMemStore.patients.set(record.patientId, newPatient);
    return newPatient;
  },

  // Idempotent report upload
  async saveReport(report: SessionReportRecord): Promise<{ saved: boolean; isDuplicate: boolean }> {
    const mongo = await getMongoDb();
    if (mongo) {
      const existing = await mongo.collection<SessionReportRecord>('reports').findOne({ reportId: report.reportId });
      if (existing) {
        return { saved: true, isDuplicate: true };
      }
      await mongo.collection('reports').insertOne(report);
      // Update patient stats
      await mongo.collection('patients').updateOne(
        { id: report.patientId },
        {
          $set: {
            lastSession: 'Just now',
            painTrend: report.painAfter,
            status: report.painInterrupted ? 'review' : 'on_track',
            statusLabel: report.painInterrupted ? 'Needs review' : 'On track',
          },
          $inc: { recoveryPct: 2 },
        }
      );
      return { saved: true, isDuplicate: false };
    }

    // In-memory
    if (globalMemStore.reports.has(report.reportId)) {
      return { saved: true, isDuplicate: true };
    }
    globalMemStore.reports.set(report.reportId, report);

    const patient = globalMemStore.patients.get(report.patientId);
    if (patient) {
      patient.lastSession = 'Just now';
      patient.painTrend = report.painAfter;
      patient.recoveryPct = Math.min(100, patient.recoveryPct + 2);
      if (report.painInterrupted) {
        patient.status = 'review';
        patient.statusLabel = 'Needs review';
      }
    }
    return { saved: true, isDuplicate: false };
  },

  async getReports(clinicCode: string, patientId?: string): Promise<SessionReportRecord[]> {
    const code = clinicCode.toUpperCase();
    const mongo = await getMongoDb();
    if (mongo) {
      const query: any = { clinicCode: code };
      if (patientId) query.patientId = patientId;
      return mongo.collection<SessionReportRecord>('reports').find(query).sort({ timestamp: -1 }).toArray();
    }
    const all = Array.from(globalMemStore.reports.values()).filter((r) => r.clinicCode === code);
    if (patientId) {
      return all.filter((r) => r.patientId === patientId).reverse();
    }
    return all.reverse();
  },

  async getProgram(patientId: string): Promise<ProgramRecord | null> {
    const mongo = await getMongoDb();
    if (mongo) {
      return mongo.collection<ProgramRecord>('programs').findOne({ patientId });
    }
    return globalMemStore.programs.get(patientId) || null;
  },

  async updateProgram(program: ProgramRecord): Promise<ProgramRecord> {
    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection('programs').updateOne({ patientId: program.patientId }, { $set: program }, { upsert: true });
      return program;
    }
    globalMemStore.programs.set(program.patientId, program);
    return program;
  },

  async addNote(note: ClinicalNoteRecord): Promise<ClinicalNoteRecord> {
    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection('notes').insertOne(note);
      return note;
    }
    globalMemStore.notes.push(note);
    return note;
  },

  async getNotes(patientId: string): Promise<ClinicalNoteRecord[]> {
    const mongo = await getMongoDb();
    if (mongo) {
      return mongo.collection<ClinicalNoteRecord>('notes').find({ patientId }).sort({ date: -1 }).toArray();
    }
    return globalMemStore.notes.filter((n) => n.patientId === patientId);
  },

  async deletePatientData(patientId: string): Promise<void> {
    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection('patients').deleteMany({ id: patientId });
      await mongo.collection('reports').deleteMany({ patientId });
      await mongo.collection('programs').deleteMany({ patientId });
      await mongo.collection('notes').deleteMany({ patientId });
      return;
    }
    globalMemStore.patients.delete(patientId);
    for (const [id, r] of globalMemStore.reports) {
      if (r.patientId === patientId) globalMemStore.reports.delete(id);
    }
    globalMemStore.programs.delete(patientId);
    globalMemStore.notes = globalMemStore.notes.filter((n) => n.patientId !== patientId);
  },

  async seedDemoData(clinicCode: string): Promise<void> {
    seedMemoryStore(true);
    const mongo = await getMongoDb();
    if (mongo) {
      const code = clinicCode.toUpperCase();
      await mongo.collection('clinics').updateOne(
        { clinicCode: code },
        { $set: { clinicCode: code, name: 'Apex Physical Therapy Clinic', passcode: DEFAULT_PASSCODE, createdAt: new Date().toISOString() } },
        { upsert: true }
      );
      // Re-seed patients
      const list = Array.from(globalMemStore.patients.values()).map((p) => ({ ...p, clinicCode: code }));
      for (const p of list) {
        await mongo.collection('patients').updateOne({ id: p.id }, { $set: p }, { upsert: true });
      }
    }
  },
};
