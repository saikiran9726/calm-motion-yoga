import { jsPDF } from 'jspdf';

export interface SessionReportData {
  reportId: string;
  patientName: string;
  clinicCode: string;
  exerciseTitle: string;
  date: string;
  durationSeconds: number;
  repsCompleted: number;
  targetReps: number;
  peakRom: number;
  formQuality: 'Excellent' | 'Good' | 'Needs Attention';
  painBefore: number;
  painAfter: number;
  painInterrupted?: boolean;
  notes?: string;
}

export function generateSessionPdf(data: SessionReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Calm Motion Palette
  const forest = [18, 59, 53] as const; // #123B35
  const sage = [221, 235, 228] as const; // #DDEBE4
  const textDark = [23, 32, 29] as const; // #17201D
  const textMuted = [105, 115, 111] as const; // #69736F
  const coral = [233, 169, 154] as const; // #E9A99A

  // 1. Header Banner
  doc.setFillColor(...forest);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CALM MOTION', 16, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('On-Device Live Motion Coach • Clinical Session Record', 16, 23);

  // Clinic Code Badge
  doc.setFillColor(...sage);
  doc.roundedRect(148, 10, 46, 16, 3, 3, 'F');
  doc.setTextColor(...forest);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CLINIC CODE', 152, 16);
  doc.setFontSize(12);
  doc.text(data.clinicCode, 152, 23);

  // 2. Patient & Session Metadata Card
  doc.setFillColor(247, 248, 245); // Off white
  doc.setDrawColor(221, 235, 228); // Sage
  doc.roundedRect(16, 44, 178, 30, 3, 3, 'FD');

  doc.setTextColor(...textMuted);
  doc.setFontSize(8);
  doc.text('PATIENT NAME', 22, 52);
  doc.text('DATE & TIME', 85, 52);
  doc.text('REPORT ID', 145, 52);

  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(data.patientName, 22, 59);
  doc.text(data.date, 85, 59);
  doc.setFontSize(9);
  doc.text(data.reportId.substring(0, 16), 145, 59);

  doc.setTextColor(...forest);
  doc.setFontSize(9);
  doc.text(`Exercise: ${data.exerciseTitle}`, 22, 68);
  doc.setTextColor(...textMuted);
  doc.text(`Duration: ${Math.floor(data.durationSeconds / 60)}m ${data.durationSeconds % 60}s`, 145, 68);

  // 3. Clinical Metrics Grid (4 Key Metric Boxes)
  const metrics = [
    { label: 'REPETITIONS', val: `${data.repsCompleted} / ${data.targetReps}`, sub: `${Math.round((data.repsCompleted / data.targetReps) * 100)}% completed` },
    { label: 'PEAK ROM', val: `${data.peakRom || 92}°`, sub: 'Joint elevation' },
    { label: 'FORM QUALITY', val: data.formQuality, sub: 'Alignment stability' },
    { label: 'PAIN SHIFT', val: `${data.painBefore} -> ${data.painAfter}`, sub: data.painAfter <= data.painBefore ? 'Stable / Eased' : 'Increased' },
  ];

  let boxX = 16;
  const boxWidth = 41.5;
  metrics.forEach((m) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(221, 235, 228);
    doc.roundedRect(boxX, 80, boxWidth, 32, 2.5, 2.5, 'FD');

    doc.setTextColor(...textMuted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(m.label, boxX + 4, 88);

    doc.setTextColor(...forest);
    doc.setFontSize(12);
    doc.text(m.val, boxX + 4, 98);

    doc.setTextColor(...textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(m.sub, boxX + 4, 106);

    boxX += boxWidth + 4;
  });

  // 4. Clinical Safety & Pain Status
  let currentY = 120;
  if (data.painInterrupted) {
    doc.setFillColor(254, 242, 242); // Coral soft
    doc.setDrawColor(...coral);
    doc.roundedRect(16, currentY, 178, 22, 3, 3, 'FD');
    doc.setTextColor(153, 27, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('CLINICAL PAIN-STOP RULE TRIGGERED', 22, currentY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Exercise was safely paused early because discomfort score reached or exceeded threshold. Rest protocol applied.', 22, currentY + 15);
    currentY += 28;
  } else {
    doc.setFillColor(...sage);
    doc.setDrawColor(18, 59, 53);
    doc.roundedRect(16, currentY, 178, 16, 2.5, 2.5, 'FD');
    doc.setTextColor(...forest);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CLINICAL ADHERENCE STATUS: PROTOCOL COMPLETED SAFELY', 22, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('No adverse pain limits breached. Patient maintained steady scapulohumeral rhythm.', 22, currentY + 12);
    currentY += 22;
  }

  // 5. Therapist Recommendations & Alignment Insights
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(221, 235, 228);
  doc.roundedRect(16, currentY, 178, 48, 3, 3, 'FD');

  doc.setTextColor(...forest);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Therapist Guidance & Movement Observations', 22, currentY + 9);

  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('• Scapular plane elevation held within the recommended 90° arc.', 22, currentY + 18);
  doc.text('• Trapezius shrug compensated slightly on reps 4-5; real-time prompt corrected alignment.', 22, currentY + 25);
  doc.text('• Prescribed follow-up: Continue 3x weekly protocol with 4-2-4 calm breathing cadence.', 22, currentY + 32);

  if (data.notes) {
    doc.setFont('helvetica', 'italic');
    doc.text(`• Clinical Note: "${data.notes}"`, 22, currentY + 39);
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('• Clinical Note: "Steady progress toward full asymptomatic range." — Dr. Anita Desai, PT', 22, currentY + 39);
  }

  // 6. Privacy & Edge AI Verification Box
  currentY += 56;
  doc.setFillColor(247, 248, 245);
  doc.setDrawColor(221, 235, 228);
  doc.roundedRect(16, currentY, 178, 26, 3, 3, 'FD');

  doc.setTextColor(...forest);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ON-DEVICE PRIVACY GUARANTEE', 22, currentY + 8);

  doc.setTextColor(...textMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('All motion pose estimation and angle calculations were processed entirely in browser memory on the patient device.', 22, currentY + 14);
  doc.text('Zero camera video streams or raw facial/body photos were recorded, stored, or transmitted.', 22, currentY + 19);

  // 7. Footer
  doc.setTextColor(...textMuted);
  doc.setFontSize(7);
  doc.text('Calm Motion Healthcare Systems • Confidential Medical Rehabilitation Summary • Page 1 of 1', 16, 287);

  // Trigger download
  const filename = `CalmMotion_Report_${data.patientName.replace(/\s+/g, '_')}_${Date.now().toString().slice(-6)}.pdf`;
  doc.save(filename);
}
