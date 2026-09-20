interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limiting map per IP + clinic code.
// Note: In a multi-instance production environment, use a shared key-value store such as Redis for distributed rate limiting.
const loginAttempts = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(
  ip: string,
  clinicCode: string
): { allowed: boolean; retryAfterSec?: number } {
  const key = `${ip || "unknown"}:${clinicCode.toUpperCase()}`;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 5;

  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true };
}

