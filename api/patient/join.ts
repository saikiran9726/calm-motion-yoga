import { PatientJoinSchema } from "../_lib/validation";
import { dbService } from "../_lib/db";
import { generatePatientId, generatePatientToken, hashToken } from "../_lib/crypto";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["POST"])) return;

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

