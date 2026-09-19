import { db } from './db';

let isSyncing = false;

export async function queueReportForSync(reportPayload: any): Promise<void> {
  const reportId = reportPayload.reportId || 'rep-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  reportPayload.reportId = reportId;

  // Add to Dexie Outbox
  await db.outbox.add({
    reportId,
    payload: reportPayload,
    createdAt: Date.now(),
    retries: 0,
    status: 'pending',
  });

  // Attempt sync immediately if online
  if (navigator.onLine) {
    triggerOutboxSync();
  }
}

export async function triggerOutboxSync(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  let synced = 0;
  let failed = 0;

  try {
    const pendingItems = await db.outbox.where('status').equals('pending').toArray();

    for (const item of pendingItems) {
      if (!item.id) continue;
      try {
        await db.outbox.update(item.id, { status: 'syncing' });

        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (response.ok) {
          // Successfully uploaded or acknowledged duplicate: remove from outbox
          await db.outbox.delete(item.id);
          synced++;
        } else {
          // Mark as failed and increment retry
          await db.outbox.update(item.id, {
            status: 'pending',
            retries: item.retries + 1,
          });
          failed++;
        }
      } catch (e) {
        await db.outbox.update(item.id, {
          status: 'pending',
          retries: item.retries + 1,
        });
        failed++;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

// Auto-sync listeners when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Outbox] Network reconnected, flushing offline outbox queue...');
    triggerOutboxSync();
  });

  // Background sync check on window focus
  window.addEventListener('focus', () => {
    if (navigator.onLine) {
      triggerOutboxSync();
    }
  });
}
