import { dbService } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const patientId = req.query.patientId as string;
    const clinicCode = (req.query.clinicCode as string) || 'CALM01';

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const patient = await dbService.getPatient(patientId);
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
