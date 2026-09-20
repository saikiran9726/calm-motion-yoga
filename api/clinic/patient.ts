import { dbService } from "../_lib/db.js";
import { requireClinic } from "../_lib/auth.js";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http.js";
import { PatientIdQuerySchema } from "../_lib/validation.js";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["GET"])) return;

  const auth = await requireClinic(req, res);
  if (!auth) return;

  try {
    const parse = PatientIdQuerySchema.safeParse(req.query);
    if (!parse.success) {
      return res.status(400).json({ error: "Invalid or missing patientId" });
    }

    const { patientId } = parse.data;
    const clinicCode = auth.clinicCode;

    const patient = await dbService.getPatient(patientId);
    if (!patient || patient.clinicCode !== clinicCode) {
      return res.status(404).json({ error: "Patient not found in clinic" });
    }

    const reports = await dbService.getReports(clinicCode, patientId);
    const program = await dbService.getProgram(patientId);
    const notes = await dbService.getNotes(patientId);

    return res.status(200).json({
      success: true,
      patient,
      reports,
      program,
      notes,
    });
  } catch {
    return res.status(500).json({ error: "Failed to retrieve patient details" });
  }
}

