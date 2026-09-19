import { SessionReportSchema } from './_lib/validation';
import { dbService } from './_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const clinicCode = (req.query.clinicCode as string) || 'CALM01';
    const patientId = req.query.patientId as string | undefined;
    const reports = await dbService.getReports(clinicCode, patientId);
    return res.status(200).json({ success: true, reports });
  }

  if (req.method === 'POST') {
    const parse = SessionReportSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const { saved, isDuplicate } = await dbService.saveReport({
      ...parse.data,
      timestamp: parse.data.timestamp || Date.now(),
    });

    return res.status(200).json({
      success: true,
      saved,
      isDuplicate,
      message: isDuplicate ? 'Report already recorded (idempotent ignore)' : 'Report saved and clinical stats updated',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
