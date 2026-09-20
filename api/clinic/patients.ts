import { dbService } from "../_lib/db.js";
import { requireClinic } from "../_lib/auth.js";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http.js";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["GET"])) return;

  const auth = await requireClinic(req, res);
  if (!auth) return;

  try {
    // Clinic code derived exclusively from verified JWT
    const clinicCode = auth.clinicCode;
    const patients = await dbService.getPatients(clinicCode);
    const reports = await dbService.getReports(clinicCode);

    return res.status(200).json({
      success: true,
      clinicCode,
      patients,
      recentReportsCount: reports.length,
      latestReportTimestamp: reports[0]?.timestamp || null,
    });
  } catch {
    return res.status(500).json({ error: "Failed to retrieve patients" });
  }
}

