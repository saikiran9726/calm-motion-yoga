import Dexie, { type Table } from 'dexie';

export interface UserSession {
  id?: number;
  reportId?: string;
  date: string;
  type: 'yoga' | 'physio' | 'mobility';
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
  status: 'pending' | 'syncing' | 'failed';
}

export class CalmMotionDB extends Dexie {
  sessions!: Table<UserSession>;
  painLogs!: Table<PainLog>;
  outbox!: Table<OutboxReport>;

  constructor() {
    super('CalmMotionDB');
    this.version(2).stores({
      sessions: '++id, date, type, reportId',
      painLogs: '++id, timestamp, area, score',
      outbox: '++id, reportId, status, createdAt',
    });
  }
}

export const db = new CalmMotionDB();
