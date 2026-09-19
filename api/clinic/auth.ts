import { ClinicAuthSchema } from '../_lib/validation';
import { dbService } from '../_lib/db';

export default async function handler(req: any, res: any) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = ClinicAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { clinicCode, passcode, name } = parseResult.data;
    const clinic = await dbService.createOrVerifyClinic(clinicCode, passcode, name);

    return res.status(200).json({
      success: true,
      clinic: {
        clinicCode: clinic.clinicCode,
        name: clinic.name,
      },
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Authentication failed' });
  }
}
