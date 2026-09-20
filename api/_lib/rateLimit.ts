interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Failed login attempts per IP + clinicCode (max 5 per 10 mins)
const ipClinicFailedLogins = new Map<string, RateLimitEntry>();

// Failed login attempts per clinicCode across all IPs (max 20 per 10 mins)
const clinicGlobalFailedLogins = new Map<string, RateLimitEntry>();

// Patient join attempts per IP (max 10 per hour)
const joinAttemptsPerIp = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(
  ip: string,
  clinicCode: string
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const normIp = ip || "unknown";
  const normClinic = clinicCode.toUpperCase();
  const ipClinicKey = `${normIp}:${normClinic}`;

  // Check IP + clinic limit (5 attempts / 10 min)
  const ipEntry = ipClinicFailedLogins.get(ipClinicKey);
  if (ipEntry && now < ipEntry.resetTime && ipEntry.count >= 5) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((ipEntry.resetTime - now) / 1000),
    };
  }

  // Check global clinic limit across all IPs (20 attempts / 10 min)
  const clinicEntry = clinicGlobalFailedLogins.get(normClinic);
  if (clinicEntry && now < clinicEntry.resetTime && clinicEntry.count >= 20) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((clinicEntry.resetTime - now) / 1000),
    };
  }

  return { allowed: true };
}

export function recordLoginFailure(ip: string, clinicCode: string): void {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const normIp = ip || "unknown";
  const normClinic = clinicCode.toUpperCase();
  const ipClinicKey = `${normIp}:${normClinic}`;

  // 1. Update IP + Clinic entry
  const ipEntry = ipClinicFailedLogins.get(ipClinicKey);
  if (!ipEntry || now > ipEntry.resetTime) {
    ipClinicFailedLogins.set(ipClinicKey, { count: 1, resetTime: now + windowMs });
  } else {
    ipEntry.count += 1;
  }

  // 2. Update Global Clinic entry
  const clinicEntry = clinicGlobalFailedLogins.get(normClinic);
  if (!clinicEntry || now > clinicEntry.resetTime) {
    clinicGlobalFailedLogins.set(normClinic, { count: 1, resetTime: now + windowMs });
  } else {
    clinicEntry.count += 1;
  }
}

export function recordLoginSuccess(ip: string, clinicCode: string): void {
  const normIp = ip || "unknown";
  const normClinic = clinicCode.toUpperCase();
  const ipClinicKey = `${normIp}:${normClinic}`;
  ipClinicFailedLogins.delete(ipClinicKey);
}

export function checkJoinRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 10;
  const normIp = ip || "unknown";

  const entry = joinAttemptsPerIp.get(normIp);
  if (!entry || now > entry.resetTime) {
    joinAttemptsPerIp.set(normIp, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetRateLimitsForTests(): void {
  ipClinicFailedLogins.clear();
  clinicGlobalFailedLogins.clear();
  joinAttemptsPerIp.clear();
}

