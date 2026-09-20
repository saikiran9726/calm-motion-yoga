import { PatientJoinSchema } from "../_lib/validation.js";
import { dbService } from "../_lib/db.js";
import { generatePatientId, generatePatientToken, hashToken } from "../_lib/crypto.js";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http.js";
import { checkJoinRateLimit } from "../_lib/rateLimit.js";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["POST"])) return;

  const clientIp =
    req.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  const rateCheck = checkJoinRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSec || 3600));
    return res.status(429).json({ error: "Too many join attempts. Try again later." });
  }

  try {
    const parse = PatientJoinSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Validation failed", details: parse.error.format() });
    }

    const { name, clinicCode, condition } = parse.data;

    // Verify the clinic exists before joining
    const clinic = await dbService.getClinic(clinicCode);
    if (!clinic) {
      return res.status(404).json({ error: "Clinic code not found. Please verify with your physiotherapist." });
    }

    const patientId = generatePatientId();
    const patientToken = generatePatientToken();
    const tokenHash = hashToken(patientToken);

    const patient = await dbService.joinPatient({
      patientId,
      name,
      clinicCode,
      condition,
      tokenHash,
    });

    return res.status(200).json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.name,
        clinicCode: patient.clinicCode,
        condition: patient.condition,
        status: patient.status,
      },
      patientToken, // Returned once upon registration
    });
  } catch {
    return res.status(500).json({ error: "Failed to register patient" });
  }
}

