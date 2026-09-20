import { dbService } from "../_lib/db";
import { requireClinic } from "../_lib/auth";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["POST"])) return;

  if (process.env.DEMO_MODE !== "true") {
    return res.status(403).json({ error: "Demo seeding is disabled in this environment" });
  }

  const auth = await requireClinic(req, res);
  if (!auth) return;

  try {
    const clinicCode = auth.clinicCode;
    await dbService.seedDemoData(clinicCode);
    const patients = await dbService.getPatients(clinicCode);

    return res.status(200).json({
      success: true,
      message: "Demo dataset loaded successfully",
      clinicCode,
      patients,
    });
  } catch {
    return res.status(500).json({ error: "Failed to seed demo data" });
  }
}

