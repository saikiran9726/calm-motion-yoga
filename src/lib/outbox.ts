import { db, getPatientIdentity } from "./db";

let isSyncing = false;
let listenersInitialized = false;

export const MAX_SYNC_RETRIES = 6;

/**
 * On application start, reset any outbox records stuck in "syncing" state back to "pending".
 */
export async function resetStuckSyncingItems(): Promise<number> {
  const syncingItems = await db.outbox.where("status").equals("syncing").toArray();
  let resetCount = 0;
  for (const item of syncingItems) {
    if (item.id) {
      await db.outbox.update(item.id, { status: "pending" });
      resetCount++;
    }
  }
  return resetCount;
}

/**
 * Queue a new movement telemetry report in Dexie outbox.
 * If patient has not joined a clinic, marks as local-only or skips cloud sync.
 */
export async function queueReportForSync(reportPayload: any): Promise<void> {
  const identity = await getPatientIdentity();

  // If user has NOT joined a clinic, sessions remain local only
  if (!identity || !identity.patientToken) {
    return;
  }

  const reportId =
    reportPayload.reportId ||
    "rep-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6);

  reportPayload.reportId = reportId;
  reportPayload.patientId = identity.patientId;
  reportPayload.clinicCode = identity.clinicCode;

  await db.outbox.add({
    reportId,
    payload: reportPayload,
    createdAt: Date.now(),
    retries: 0,
    status: "pending",
  });

  if (typeof navigator !== "undefined" && navigator.onLine) {
    triggerOutboxSync();
  }
}

export function calculateBackoffDelay(retries: number): number {
  if (retries <= 0) return 0;
  return Math.min(60000, 1000 * Math.pow(2, retries - 1));
}

/**
 * Flush outbox queue to the cloud clinic backend.
 */
export async function triggerOutboxSync(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  let synced = 0;
  let failed = 0;

  try {
    const identity = await getPatientIdentity();
    if (!identity || !identity.patientToken) {
      // Not connected to a clinic: do not attempt cloud sync
      return { synced: 0, failed: 0 };
    }

    const pendingItems = await db.outbox.where("status").equals("pending").toArray();
    const now = Date.now();

    for (const item of pendingItems) {
      if (!item.id) continue;

      // Exponential backoff check: 1s, 2s, 4s, 8s, 16s, 32s (capped at 60s)
      if (item.retries > 0 && item.lastAttemptAt) {
        const delayMs = calculateBackoffDelay(item.retries);
        if (now - item.lastAttemptAt < delayMs) {
          continue; // Backoff period has not elapsed yet
        }
      }

      try {
        await db.outbox.update(item.id, { status: "syncing", lastAttemptAt: now });

        // Ensure patient identity is bound to the payload
        const payload = {
          ...item.payload,
          patientId: identity.patientId,
          clinicCode: identity.clinicCode,
        };

        const response = await fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${identity.patientToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          await db.outbox.delete(item.id);
          synced++;
        } else if (response.status === 401 || response.status === 403) {
          // Authentication failure: stop retrying and mark failed
          await db.outbox.update(item.id, {
            status: "failed",
            errorMessage: "Clinic connection expired. Please rejoin the clinic in Profile.",
          });
          failed++;
        } else {
          // Transient error: increment retries or mark failed if over limit
          const nextRetries = item.retries + 1;
          if (nextRetries >= MAX_SYNC_RETRIES) {
            await db.outbox.update(item.id, {
              status: "failed",
              retries: nextRetries,
              errorMessage: "Exceeded maximum retry attempts",
            });
          } else {
            await db.outbox.update(item.id, {
              status: "pending",
              retries: nextRetries,
            });
          }
          failed++;
        }
      } catch {
        const nextRetries = item.retries + 1;
        if (nextRetries >= MAX_SYNC_RETRIES) {
          await db.outbox.update(item.id, {
            status: "failed",
            retries: nextRetries,
            errorMessage: "Network unreachable after maximum retries",
          });
        } else {
          await db.outbox.update(item.id, {
            status: "pending",
            retries: nextRetries,
          });
        }
        failed++;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

export function initOutboxListeners(): void {
  if (listenersInitialized || typeof window === "undefined") return;
  listenersInitialized = true;

  // Reset any stuck syncing items on application startup
  resetStuckSyncingItems().catch(() => {});

  window.addEventListener("online", () => {
    triggerOutboxSync().catch(() => {});
  });
}

// Auto-initialize listeners once in browser environment
if (typeof window !== "undefined") {
  initOutboxListeners();
}

