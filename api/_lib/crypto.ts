import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

/**
 * Hash a passcode using Node crypto.scrypt with a random 16-byte salt.
 * Formats as salt:derivedKeyHex
 */
export async function hashPasscode(passcode: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(passcode, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a passcode against a stored salt:derivedKeyHex using timing-safe comparison.
 */
export async function verifyPasscode(passcode: string, storedHash: string): Promise<boolean> {
  if (!storedHash || typeof storedHash !== "string") return false;
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  if (!salt || !key) return false;

  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = (await scryptAsync(passcode, salt, 64)) as Buffer;
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Hash a sensitive token (such as patient bearer token) for secure database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a cryptographically secure random patient bearer token (32 bytes base64url).
 */
export function generatePatientToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generate a random patient ID.
 */
export function generatePatientId(): string {
  return "patient-" + crypto.randomBytes(8).toString("hex");
}

