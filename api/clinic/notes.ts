import { NoteCreateSchema, PatientIdQuerySchema } from "../_lib/validation.js";
import { dbService } from "../_lib/db.js";
import { requireClinic } from "../_lib/auth.js";
import { handleCors, ensureMethod, checkServerConfig } from "../_lib/http.js";

export default async function handler(req: any, res: any) {
  if (!checkServerConfig(res)) return;
  if (handleCors(req, res)) return;
  if (!ensureMethod(req, res, ["GET", "POST"])) return;

  const auth = await requireClinic(req, res);
  if (!auth) return;

  const clinicCode = auth.clinicCode;

  if (req.method === "GET") {
    const parse = PatientIdQuerySchema.safeParse(req.query);
    if (!parse.success) return res.status(400).json({ error: "Invalid patientId" });

    const patient = await dbService.getPatient(parse.data.patientId);
    if (!patient || patient.clinicCode !== clinicCode) {
      return res.status(404).json({ error: "Patient not found in clinic" });
    }

    const notes = await dbService.getNotes(parse.data.patientId);
    return res.status(200).json({ success: true, notes });
  }

  if (req.method === "POST") {
    const parse = NoteCreateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Validation failed", details: parse.error.format() });
    }

    const patient = await dbService.getPatient(parse.data.patientId);
    if (!patient || patient.clinicCode !== clinicCode) {
      return res.status(404).json({ error: "Patient not found in clinic" });
    }

    const newNote = await dbService.addNote({
      id: "note-" + Date.now().toString(36),
      patientId: parse.data.patientId,
      clinicCode,
      therapistName: parse.data.therapistName || "Dr. Anita Desai, PT",
      content: parse.data.content,
      date: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    return res.status(201).json({ success: true, note: newNote });
  }
}

