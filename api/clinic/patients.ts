import { dbService } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const clinicCode = (req.query.clinicCode as string) || 'CALM01';
    const patients = await dbService.getPatients(clinicCode);
    const reports = await dbService.getReports(clinicCode);

    return res.status(200).json({
      success: true,
      clinicCode,
      patients,
      recentReportsCount: reports.length,
      latestReportTimestamp: reports[0]?.timestamp || null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
