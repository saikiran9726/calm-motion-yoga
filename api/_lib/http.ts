export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function checkServerConfig(res: any): boolean {
  if (isProductionEnv()) {
    const jwtSecret = process.env.JWT_SECRET;
    const passcode = process.env.CLINIC_ADMIN_PASSCODE;
    const mongoUri = process.env.MONGODB_URI;

    if (
      !jwtSecret ||
      jwtSecret.length < 32 ||
      jwtSecret.toLowerCase().startsWith("change-me") ||
      jwtSecret === "change-me-in-production"
    ) {
      console.error("FATAL: JWT_SECRET must be changed in production. Current value is placeholder.");
      res.status(503).json({ error: "Server not configured" });
      return false;
    }

    if (
      !passcode ||
      passcode.length < 8 ||
      passcode.toLowerCase().startsWith("change-me") ||
      passcode === "CALM2026"
    ) {
      console.error("FATAL: CLINIC_ADMIN_PASSCODE must be changed in production. Current value is placeholder or too short.");
      res.status(503).json({ error: "Server not configured" });
      return false;
    }

    if (!mongoUri) {
      console.error("FATAL: MONGODB_URI is required in production environment.");
      res.status(503).json({ error: "Server not configured" });
      return false;
    }
  } else {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.toLowerCase().startsWith("change-me")) {
      console.warn("WARNING: JWT_SECRET is set to a development placeholder.");
    }
    const passcode = process.env.CLINIC_ADMIN_PASSCODE;
    if (passcode && (passcode.toLowerCase().startsWith("change-me") || passcode === "CALM2026")) {
      console.warn("WARNING: CLINIC_ADMIN_PASSCODE is set to default/placeholder in non-production mode.");
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

