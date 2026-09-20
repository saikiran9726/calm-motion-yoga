import { describe, it, expect, vi } from 'vitest';
import { MAX_SYNC_RETRIES, calculateBackoffDelay, resetStuckSyncingItems } from '../../lib/outbox';
import { PAIN_STOP_THRESHOLD } from '../../lib/constants';
import { DEFAULT_PROGRAM, fetchProgram } from '../../lib/program';
import { db } from '../../lib/db';

describe('Outbox and Program Unit Tests', () => {
  describe('Exponential backoff calculation', () => {
    it('returns 0ms for 0 retries', () => {
      expect(calculateBackoffDelay(0)).toBe(0);
    });

    it('calculates exponential delays for retries 1 through 6', () => {
      expect(calculateBackoffDelay(1)).toBe(1000);
      expect(calculateBackoffDelay(2)).toBe(2000);
      expect(calculateBackoffDelay(3)).toBe(4000);
      expect(calculateBackoffDelay(4)).toBe(8000);
      expect(calculateBackoffDelay(5)).toBe(16000);
      expect(calculateBackoffDelay(6)).toBe(32000);
    });

    it('caps backoff delay at 60 seconds (60000ms)', () => {
      expect(calculateBackoffDelay(7)).toBe(60000);
      expect(calculateBackoffDelay(10)).toBe(60000);
    });

    it('defines MAX_SYNC_RETRIES as 6', () => {
      expect(MAX_SYNC_RETRIES).toBe(6);
    });
  });

  describe('Program fallback to PAIN_STOP_THRESHOLD', () => {
    it('ensures PAIN_STOP_THRESHOLD baseline is 5', () => {
      expect(PAIN_STOP_THRESHOLD).toBe(5);
    });

    it('defaults DEFAULT_PROGRAM maxPainThreshold to PAIN_STOP_THRESHOLD', () => {
      expect(DEFAULT_PROGRAM.maxPainThreshold).toBe(PAIN_STOP_THRESHOLD);
      expect(DEFAULT_PROGRAM.maxPainThreshold).toBe(5);
    });

    it('falls back to PAIN_STOP_THRESHOLD when no clinic identity is joined', async () => {
      vi.spyOn(db.patientProfile, 'get').mockResolvedValueOnce(undefined);
      vi.spyOn(db.cachedProgram, 'toCollection').mockReturnValueOnce({
        first: vi.fn().mockResolvedValueOnce(undefined),
      } as any);

      const prog = await fetchProgram();
      expect(prog.maxPainThreshold).toBe(PAIN_STOP_THRESHOLD);
      expect(prog.programName).toBe('General Mobility Guidance');
    });

    it('preserves therapist custom maxPainThreshold when present in cache', async () => {
      vi.spyOn(db.patientProfile, 'get').mockResolvedValueOnce(undefined);
      vi.spyOn(db.cachedProgram, 'toCollection').mockReturnValueOnce({
        first: vi.fn().mockResolvedValueOnce({
          patientId: 'patient-test',
          programName: 'Rotator Cuff Protocol',
          maxPainThreshold: 4,
          reps: 12,
          targetRom: 85,
          guidanceNotes: 'Gentle progression',
          updatedAt: new Date().toISOString(),
        }),
      } as any);

      const prog = await fetchProgram();
      expect(prog.maxPainThreshold).toBe(4);
      expect(prog.reps).toBe(12);
      expect(prog.targetRom).toBe(85);
      expect(prog.programName).toBe('Rotator Cuff Protocol');
    });
  });

  describe('Outbox stuck syncing item reset', () => {
    it('resets stuck syncing items to pending', async () => {
      const mockUpdate = vi.fn().mockResolvedValue(1);
      vi.spyOn(db.outbox, 'where').mockReturnValueOnce({
        equals: vi.fn().mockReturnValueOnce({
          toArray: vi.fn().mockResolvedValueOnce([
            { id: 1, reportId: 'rep-1', status: 'syncing', retries: 1 },
            { id: 2, reportId: 'rep-2', status: 'syncing', retries: 0 },
          ]),
        }),
      } as any);
      vi.spyOn(db.outbox, 'update').mockImplementation(mockUpdate);

      const count = await resetStuckSyncingItems();
      expect(count).toBe(2);
      expect(mockUpdate).toHaveBeenCalledWith(1, { status: 'pending' });
      expect(mockUpdate).toHaveBeenCalledWith(2, { status: 'pending' });
    });

    it('returns 0 when no items are stuck in syncing', async () => {
      vi.spyOn(db.outbox, 'where').mockReturnValueOnce({
        equals: vi.fn().mockReturnValueOnce({
          toArray: vi.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      const count = await resetStuckSyncingItems();
      expect(count).toBe(0);
    });
  });
});
