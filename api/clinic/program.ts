import { ProgramUpdateSchema } from '../_lib/validation';
import { dbService } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const patientId = req.query.patientId as string;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });
    const program = await dbService.getProgram(patientId);
    return res.status(200).json({ success: true, program });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const parse = ProgramUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const updated = await dbService.updateProgram({
      ...parse.data,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, program: updated });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
