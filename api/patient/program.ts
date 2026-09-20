import { dbService } from "../_lib/db";
import { requirePatient } from "../_lib/auth";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["GET"])) return;

  const patient = await requirePatient(req, res);
  if (!patient) return;

  try {
    const program = await dbService.getProgram(patient.id);
    return res.status(200).json({
      success: true,
      program,
    });
  } catch {
    return res.status(500).json({ error: "Failed to retrieve prescribed program" });
  }
}

