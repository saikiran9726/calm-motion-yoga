import { SignJWT, jwtVerify } from "jose";
import { dbService, PatientRecord } from "./db.js";
import { hashToken } from "./crypto.js";

function getJwtSecret(): Uint8Array {
  const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  const secret =
    process.env.JWT_SECRET ||
    (!isProd ? "dev-secret-calm-motion-yoga-32-chars-long-local" : "");

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  if (isProd && (secret.toLowerCase().startsWith("change-me") || secret === "change-me-in-production")) {
    console.error("FATAL: JWT_SECRET must be changed in production. Current value is placeholder.");
    throw new Error("JWT_SECRET must be changed in production. Current value is placeholder.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign a short-lived (8 hours) JWT for authenticated clinic sessions.
 */
export async function signClinicToken(clinicCode: string): Promise<string> {
  const secret = getJwtSecret();
  return await new SignJWT({ clinicCode: clinicCode.toUpperCase(), role: "clinic" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

/**
 * Verify a clinic JWT and extract the clinicCode.
 */
export async function verifyClinicToken(token: string): Promise<{ clinicCode: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    if (payload && typeof payload.clinicCode === "string" && payload.role === "clinic") {
      return { clinicCode: payload.clinicCode as string };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Middleware: require valid clinic JWT bearer token.
 * Sends 401 and returns null if invalid.
 */
export async function requireClinic(req: any, res: any): Promise<{ clinicCode: string } | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
    return null;
  }

  const token = authHeader.slice(7).trim();
  const verified = await verifyClinicToken(token);
  if (!verified) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    return null;
  }

  return verified;
}

/**
 * Middleware: require valid patient bearer token.
 * Hashes incoming token and queries db for matching patient.
 * Sends 401 and returns null if invalid.
 */
export async function requirePatient(req: any, res: any): Promise<PatientRecord | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
    return null;
  }

  const patientToken = authHeader.slice(7).trim();
  if (!patientToken) {
    res.status(401).json({ error: "Unauthorized: Invalid patient token" });
    return null;
  }

  const tokenHash = hashToken(patientToken);
  const patient = await dbService.getPatientByTokenHash(tokenHash);
  if (!patient) {
    res.status(401).json({ error: "Unauthorized: Invalid or revoked patient token" });
    return null;
  }

  return patient;
}

