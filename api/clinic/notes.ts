import { NoteCreateSchema } from '../_lib/validation';
import { dbService } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const patientId = req.query.patientId as string;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });
    const notes = await dbService.getNotes(patientId);
    return res.status(200).json({ success: true, notes });
  }

  if (req.method === 'POST') {
    const parse = NoteCreateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const newNote = await dbService.addNote({
      id: 'note-' + Date.now().toString(36),
      patientId: parse.data.patientId,
      clinicCode: parse.data.clinicCode,
      therapistName: parse.data.therapistName || 'Dr. Anita Desai, PT',
      content: parse.data.content,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    return res.status(201).json({ success: true, note: newNote });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
