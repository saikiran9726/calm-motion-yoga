import { DeleteDataSchema } from "../_lib/validation";
import { dbService } from "../_lib/db";
import { requirePatient } from "../_lib/auth";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["POST", "DELETE"])) return;

  const patient = await requirePatient(req, res);
  if (!patient) return;

  try {
    const parse = DeleteDataSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Validation failed", details: parse.error.format() });
    }

    // Patient can only delete their own data
    if (parse.data.patientId !== patient.id) {
      return res.status(403).json({ error: "Forbidden: Cannot delete data of another patient" });
    }

    await dbService.deletePatientData(patient.id);
    return res.status(200).json({
      success: true,
      message: "All cloud clinic data permanently purged for patient " + patient.id,
    });
  } catch {
    return res.status(500).json({ error: "Failed to purge patient data" });
  }
}

