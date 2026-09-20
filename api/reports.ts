import { SessionReportSchema } from "./_lib/validation";
import { dbService } from "./_lib/db";
import { requireClinic, requirePatient } from "./_lib/auth";
import { handleCors, ensureMethod, checkServerConfig } from "./_lib/http";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["GET", "POST"])) return;

  if (req.method === "GET") {
    // Clinic authentication required for reviewing session reports
    const auth = await requireClinic(req, res);
    if (!auth) return;

    const clinicCode = auth.clinicCode;
    const patientId = typeof req.query?.patientId === "string" ? req.query.patientId : undefined;

    const reports = await dbService.getReports(clinicCode, patientId);
    return res.status(200).json({ success: true, reports });
  }

  if (req.method === "POST") {
    // Patient authentication required for uploading telemetry reports
    const patient = await requirePatient(req, res);
    if (!patient) return;

    const parse = SessionReportSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Validation failed", details: parse.error.format() });
    }

    // Patient can only record their own sessions
    if (parse.data.patientId !== patient.id) {
      return res.status(403).json({ error: "Forbidden: Cannot record session report for another patient" });
    }

    const { saved, isDuplicate } = await dbService.saveReport({
      ...parse.data,
      clinicCode: patient.clinicCode,
      timestamp: parse.data.timestamp || Date.now(),
    });

    return res.status(200).json({
      success: true,
      saved,
      isDuplicate,
      message: isDuplicate
        ? "Report already recorded (idempotent ignore)"
        : "Report saved and clinical stats updated",
    });
  }
}

