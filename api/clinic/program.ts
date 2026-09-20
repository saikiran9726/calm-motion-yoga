import { ProgramUpdateSchema, PatientIdQuerySchema } from "../_lib/validation.js";
import { dbService } from "../_lib/db.js";
import { requireClinic } from "../_lib/auth.js";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http.js";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["GET", "POST", "PUT"])) return;

  const auth = await requireClinic(req, res);
  if (!auth) return;

  const clinicCode = auth.clinicCode;

  if (req.method === "GET") {
    const parse = PatientIdQuerySchema.safeParse(req.query);
    if (!parse.success) return res.status(400).json({ error: "Invalid patientId" });

    const patient = await dbService.getPatient(parse.data.patientId);
    if (!patient || patient.clinicCode !== clinicCode) {
      return res.status(404).json({ error: "Patient not found in clinic" });
    }

    const program = await dbService.getProgram(parse.data.patientId);
    return res.status(200).json({ success: true, program });
  }

  if (req.method === "POST" || req.method === "PUT") {
    const parse = ProgramUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Validation failed", details: parse.error.format() });
    }

    const patient = await dbService.getPatient(parse.data.patientId);
    if (!patient || patient.clinicCode !== clinicCode) {
      return res.status(404).json({ error: "Patient not found in clinic" });
    }

    const updated = await dbService.updateProgram({
      ...parse.data,
      clinicCode,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, program: updated });
  }
}

