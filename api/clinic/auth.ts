import { ClinicAuthSchema } from "../_lib/validation.js";
import { dbService } from "../_lib/db.js";
import { signClinicToken } from "../_lib/auth.js";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http.js";
import { checkLoginRateLimit, recordLoginFailure, recordLoginSuccess } from "../_lib/rateLimit.js";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["POST"])) return;

  const clientIp =
    req.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  let clinicCodeToLimit = "";

  try {
    const parseResult = ClinicAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Validation failed", details: parseResult.error.format() });
    }

    const { clinicCode, passcode } = parseResult.data;
    clinicCodeToLimit = clinicCode;

    const rateCheck = checkLoginRateLimit(clientIp, clinicCode);
    if (!rateCheck.allowed) {
      res.setHeader("Retry-After", String(rateCheck.retryAfterSec || 60));
      return res.status(429).json({
        error: "Too many failed login attempts. Please try again later.",
      });
    }

    const clinic = await dbService.verifyClinic(clinicCode, passcode);
    const token = await signClinicToken(clinic.clinicCode);

    recordLoginSuccess(clientIp, clinicCode);

    return res.status(200).json({
      success: true,
      token,
      clinic: {
        clinicCode: clinic.clinicCode,
        name: clinic.name,
      },
    });
  } catch {
    if (clinicCodeToLimit) {
      recordLoginFailure(clientIp, clinicCodeToLimit);
    }
    // Generic error message for any authentication failure
    return res.status(401).json({ error: "Invalid clinic code or passcode" });
  }
}

