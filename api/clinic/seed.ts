import { dbService } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const clinicCode = (req.body?.clinicCode as string) || 'CALM01';
    await dbService.seedDemoData(clinicCode);
    const patients = await dbService.getPatients(clinicCode);

    return res.status(200).json({
      success: true,
      message: 'Demo dataset loaded successfully',
      clinicCode,
      patients,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to seed demo data' });
  }
}
