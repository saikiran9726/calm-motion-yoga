export function checkServerConfig(res: any): boolean {
  if (process.env.NODE_ENV === "production") {
    const jwtSecret = process.env.JWT_SECRET;
    const passcode = process.env.CLINIC_ADMIN_PASSCODE;
    const mongoUri = process.env.MONGODB_URI;

    if (!jwtSecret || jwtSecret.length < 32 || !passcode || !mongoUri) {
      res.status(503).json({ error: "Server not configured" });
      return false;
    }
  }
  return true;
}

export function handleCors(req: any, res: any): boolean {
  const origin = req.headers?.origin;
  const host = req.headers?.host || req.headers?.["x-forwarded-host"];

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const isSameHost = host && originUrl.host === host;
      const isDevLocalhost =
        process.env.NODE_ENV !== "production" &&
        (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1");

      if (isSameHost || isDevLocalhost) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      }
    } catch {
      // Invalid origin URL, ignore
    }
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function ensureMethod(req: any, res: any, allowed: string[]): boolean {
  if (!allowed.includes(req.method)) {
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
}

export function sendError(res: any, statusCode: number, userFriendlyMessage: string): void {
  res.status(statusCode).json({ error: userFriendlyMessage });
}

