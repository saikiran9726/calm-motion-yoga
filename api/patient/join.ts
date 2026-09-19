import { PatientJoinSchema } from '../_lib/validation';
import { dbService } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const parse = PatientJoinSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const patient = await dbService.joinPatient(parse.data);
    return res.status(200).json({ success: true, patient });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
