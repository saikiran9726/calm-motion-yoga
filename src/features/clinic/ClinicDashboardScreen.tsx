import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sliders,
  RefreshCw,
  Plus,
  Lock
} from 'lucide-react';
import { Card, Button, ProgressRing, PainSlider, BottomSheet } from '@/components/ui';
import { useAppStore } from '@/lib/store';

interface Patient {
  id: string;
  name: string;
  condition: string;
  status: 'on_track' | 'missed' | 'review';
  statusLabel: string;
  recoveryPct: number;
  adherencePct: number;
  painTrend: number;
  lastSession: string;
}

interface SessionReport {
  reportId: string;
  patientId: string;
  patientName: string;
  date: string;
  exerciseTitle: string;
  repsCompleted: number;
  targetReps: number;
  peakRom: number;
  formQuality: string;
  painBefore: number;
  painAfter: number;
  painInterrupted: boolean;
  timestamp: number;
}

interface ClinicalNote {
  id: string;
  patientId: string;
  therapistName: string;
  content: string;
  date: string;
}

export const ClinicDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('clinic_auth') === 'true';
  });
  const [clinicCodeInput, setClinicCodeInput] = useState<string>('CALM01');
  const [passcodeInput, setPasscodeInput] = useState<string>('CALM2026');
  const [authError, setAuthError] = useState<string>('');

  // Dashboard Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);

  // Program Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustedPain, setAdjustedPain] = useState<number>(3);
  const [adjustedRom, setAdjustedRom] = useState<number>(95);
  const [adjustedReps, setAdjustedReps] = useState<number>(10);
  const [guidanceNoteInput, setGuidanceNoteInput] = useState<string>(
    'Focus on scapular retraction without elevating the right trapezius. Stop at 90 degrees if discomfort occurs.'
  );

  // New Note Modal
  const [newNoteText, setNewNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Polling tracker
  const lastReportCount = useRef<number>(0);
  const pollTimer = useRef<any>(null);

  // Handle Passcode Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/clinic/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicCode: clinicCodeInput.trim().toUpperCase(),
          passcode: passcodeInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('clinic_auth', 'true');
        localStorage.setItem('clinic_code', clinicCodeInput.trim().toUpperCase());
        fetchPatients(clinicCodeInput.trim().toUpperCase());
      } else {
        setAuthError(data.error || 'Invalid passcode or clinic code');
      }
    } catch {
      setAuthError('Connection error. Falling back to local demo authorization.');
      setIsAuthenticated(true);
    }
  };

  // Fetch Patients & Check for New Reports
  const fetchPatients = async (code: string) => {
    try {
      const res = await fetch(`/api/clinic/patients?clinicCode=${code}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);

        // Toast on new report arrival
        if (lastReportCount.current > 0 && data.recentReportsCount > lastReportCount.current) {
          addToast({
            title: 'New report received',
            description: 'A new patient movement session was recorded and synced.',
            type: 'info',
          });
          // Refresh selected patient data
          if (selectedPatient) {
            fetchPatientDetail(selectedPatient.id, code);
          }
        }
        lastReportCount.current = data.recentReportsCount || 0;

        // Auto-select first patient if none selected
        if (!selectedPatient && data.patients?.length > 0) {
          setSelectedPatient(data.patients[0]);
          fetchPatientDetail(data.patients[0].id, code);
        }
      }
    } catch (e) {
      console.warn('Error fetching patients:', e);
    }
  };

  const fetchPatientDetail = async (patientId: string, code: string) => {
    try {
      const res = await fetch(`/api/clinic/patient?patientId=${patientId}&clinicCode=${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.patient) setSelectedPatient(data.patient);
        setReports(data.reports || []);
        setNotes(data.notes || []);
        if (data.program) {
          setAdjustedPain(data.program.maxPainThreshold);
          setAdjustedRom(data.program.targetRom || 95);
          setAdjustedReps(data.program.reps || 10);
          setGuidanceNoteInput(data.program.guidanceNotes);
        }
      }
    } catch (e) {
      console.warn('Error fetching patient detail:', e);
    }
  };

  // Setup 5-Second Polling
  useEffect(() => {
    if (!isAuthenticated) return;

    const code = localStorage.getItem('clinic_code') || clinicCodeInput.trim().toUpperCase() || 'CALM01';
    fetchPatients(code);

    pollTimer.current = setInterval(() => {
      fetchPatients(code);
    }, 5000);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [isAuthenticated]);

  // Load Demo Data
  const handleLoadDemo = async () => {
    const code = localStorage.getItem('clinic_code') || 'CALM01';
    try {
      const res = await fetch('/api/clinic/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicCode: code }),
      });
      if (res.ok) {
        addToast({
          title: 'Demo dataset loaded',
          description: 'Re-seeded clinic patient cohort, reports, and recovery metrics.',
          type: 'success',
        });
        fetchPatients(code);
      }
    } catch {
      addToast({ title: 'Failed to load demo data', type: 'warning' });
    }
  };

  // Save Adjusted Program
  const handleSaveProgram = async () => {
    if (!selectedPatient) return;
    const code = localStorage.getItem('clinic_code') || 'CALM01';
    try {
      const res = await fetch('/api/clinic/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          clinicCode: code,
          programName: selectedPatient.condition,
          maxPainThreshold: adjustedPain,
          targetRom: adjustedRom,
          reps: adjustedReps,
          guidanceNotes: guidanceNoteInput,
        }),
      });
      if (res.ok) {
        addToast({
          title: 'Protocol updated',
          description: `Updated targets synced to ${selectedPatient.name}'s mobile device.`,
          type: 'success',
        });
        setAdjustModalOpen(false);
        fetchPatientDetail(selectedPatient.id, code);
      }
    } catch {
      addToast({ title: 'Update failed', type: 'warning' });
    }
  };

  // Add Note
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !selectedPatient) return;
    setIsSubmittingNote(true);
    const code = localStorage.getItem('clinic_code') || 'CALM01';
    try {
      const res = await fetch('/api/clinic/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          clinicCode: code,
          therapistName: 'Dr. Anita Desai, PT',
          content: newNoteText.trim(),
        }),
      });
      if (res.ok) {
        setNewNoteText('');
        addToast({ title: 'Clinical note saved', type: 'success' });
        fetchPatientDetail(selectedPatient.id, code);
      }
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // 1. Passcode Login View if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-offwhite p-5 flex flex-col justify-center items-center select-none">
        <Card variant="default" className="w-full max-w-sm p-6 space-y-5 shadow-card border border-border-subtle">
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-full bg-forest text-offwhite mx-auto flex items-center justify-center shadow-soft">
              <Stethoscope className="w-7 h-7 text-sage" />
            </div>
            <h1 className="text-title font-bold text-primary">Clinic Portal Login</h1>
            <p className="text-caption text-secondary">
              Physiotherapist supervision dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-metadata font-bold text-secondary uppercase tracking-wider">
                Clinic Code
              </label>
              <input
                type="text"
                value={clinicCodeInput}
                onChange={(e) => setClinicCodeInput(e.target.value)}
                placeholder="CALM01"
                className="w-full h-12 px-3.5 rounded-input border border-border-subtle bg-white font-mono text-body text-primary focus:outline-none focus:border-forest"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-metadata font-bold text-secondary uppercase tracking-wider">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="CALM2026"
                className="w-full h-12 px-3.5 rounded-input border border-border-subtle bg-white text-body text-primary focus:outline-none focus:border-forest"
                required
              />
            </div>

            {authError && (
              <p className="text-metadata font-bold text-coral-dark bg-coral-light/40 p-2.5 rounded-input text-center">
                {authError}
              </p>
            )}

            <Button variant="primary" size="full" type="submit" leftIcon={<Lock className="w-4 h-4" />}>
              Sign In to Clinic
            </Button>
          </form>

          <div className="pt-2 text-center text-metadata text-secondary border-t border-border-subtle">
            <p>Demo Passcode: <span className="font-mono font-bold text-forest">CALM2026</span></p>
            <p className="mt-0.5">Clinic Code: <span className="font-mono font-bold text-forest">CALM01</span></p>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Authenticated Clinic Dashboard
  return (
    <div className="min-h-screen bg-offwhite p-5 pb-28 space-y-6 select-none max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-primary hover:bg-forest/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-metadata font-bold text-forest bg-sage/60 px-3 py-1 rounded-pill flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4" />
            Clinic Code: {localStorage.getItem('clinic_code') || 'CALM01'}
          </span>

          <button
            type="button"
            onClick={handleLoadDemo}
            className="px-3 py-1 text-metadata font-bold text-forest hover:bg-forest/5 rounded-pill border border-forest/20 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Demo Data
          </button>
        </div>
      </div>

      {/* Greeting & Polling Badge */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-heading font-bold text-primary">
            Good morning, Dr. Anita Desai
          </h1>
          <p className="text-caption text-secondary">
            Apex Physical Therapy Clinic • Live Polling (5s)
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-metadata font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-pill">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Live Connected
        </span>
      </div>

      {/* Patient Cohort Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
            Patient Cohort ({patients.length})
          </span>
          <span className="text-metadata text-secondary">Auto-syncs every 5s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {patients.map((p) => {
            const isSelected = selectedPatient?.id === p.id;
            return (
              <Card
                key={p.id}
                interactive
                onClick={() => {
                  setSelectedPatient(p);
                  const code = localStorage.getItem('clinic_code') || 'CALM01';
                  fetchPatientDetail(p.id, code);
                }}
                className={`p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-forest/40 bg-sage/20 shadow-soft ring-1 ring-forest/30'
                    : 'bg-white'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-body-medium font-bold text-primary">{p.name}</h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-pill flex items-center gap-1 ${
                        p.status === 'on_track'
                          ? 'bg-sage text-forest'
                          : p.status === 'missed'
                          ? 'bg-coral-light text-coral-dark'
                          : 'bg-sand text-primary'
                      }`}
                    >
                      {p.status === 'on_track' && <CheckCircle className="w-3 h-3" />}
                      {p.status === 'missed' && <Clock className="w-3 h-3" />}
                      {p.status === 'review' && <AlertTriangle className="w-3 h-3" />}
                      {p.statusLabel}
                    </span>
                  </div>

                  <p className="text-metadata text-secondary line-clamp-1">{p.condition}</p>

                  <div className="flex items-center justify-between text-metadata text-secondary pt-1 border-t border-border-subtle">
                    <span>Recovery: <strong className="text-forest">{p.recoveryPct}%</strong></span>
                    <span>Pain: <strong className="text-forest">L{p.painTrend}</strong></span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected Patient Clinical Detail View */}
      {selectedPatient && (
        <Card variant="default" className="p-5 space-y-5 border-t-4 border-t-forest shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-metadata text-secondary font-bold uppercase tracking-wider block">
                Supervised Record
              </span>
              <h2 className="text-title font-bold text-primary">{selectedPatient.name}</h2>
              <p className="text-caption text-forest font-medium">{selectedPatient.condition}</p>
            </div>

            <ProgressRing value={selectedPatient.recoveryPct} size={68} strokeWidth={6}>
              <span className="text-caption font-bold text-forest">
                {selectedPatient.recoveryPct}%
              </span>
            </ProgressRing>
          </div>

          {/* Key Metric Gauges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-forest/5 rounded-card-sm p-3 text-center">
              <span className="text-[11px] text-secondary font-bold uppercase block">Adherence</span>
              <span className="text-title font-bold text-primary mt-0.5 block">
                {selectedPatient.adherencePct}%
              </span>
              <span className="text-[10px] text-secondary">Target: 80%+</span>
            </div>

            <div className="bg-forest/5 rounded-card-sm p-3 text-center">
              <span className="text-[11px] text-secondary font-bold uppercase block">Pain Trend</span>
              <span className="text-title font-bold text-forest mt-0.5 block">
                Level {selectedPatient.painTrend}
              </span>
              <span className="text-[10px] text-secondary">Threshold: ≤3</span>
            </div>

            <div className="bg-forest/5 rounded-card-sm p-3 text-center">
              <span className="text-[11px] text-secondary font-bold uppercase block">Last Active</span>
              <span className="text-caption font-bold text-primary mt-1 block">
                {selectedPatient.lastSession}
              </span>
              <span className="text-[10px] text-forest font-semibold">Live Sync</span>
            </div>
          </div>

          {/* Action: Adjust Program */}
          <div className="pt-1">
            <Button
              variant="secondary"
              size="full"
              leftIcon={<Sliders className="w-4 h-4" />}
              onClick={() => setAdjustModalOpen(true)}
            >
              Adjust Movement Program & Allowable Pain Threshold
            </Button>
          </div>

          {/* Recent Live Movement Reports Feed */}
          <div className="space-y-3 pt-2">
            <span className="text-metadata font-bold text-secondary uppercase tracking-wider block">
              Recent Synced Sessions ({reports.length})
            </span>

            {reports.length === 0 ? (
              <div className="p-4 bg-forest/5 rounded-card-sm text-center text-caption text-secondary">
                No session reports yet recorded for this patient. Complete a session on the mobile app to sync.
              </div>
            ) : (
              <div className="space-y-2">
                {reports.slice(0, 5).map((r) => (
                  <div
                    key={r.reportId}
                    className="p-3.5 bg-offwhite rounded-card-sm border border-border-subtle flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-caption font-bold text-primary">{r.exerciseTitle}</span>
                        {r.painInterrupted ? (
                          <span className="text-[10px] font-bold bg-coral-light text-coral-dark px-2 py-0.5 rounded-pill">
                            Pain-Stop Triggered
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-sage text-forest px-2 py-0.5 rounded-pill">
                            Completed
                          </span>
                        )}
                      </div>
                      <span className="text-metadata text-secondary mt-0.5 block">
                        {r.date} • {r.repsCompleted}/{r.targetReps} reps • Peak ROM: {r.peakRom}° • Pain {r.painBefore}→{r.painAfter}
                      </span>
                    </div>

                    <span className="text-metadata font-bold text-forest bg-white px-2.5 py-1 rounded-pill border border-border-subtle">
                      {r.formQuality}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Therapist Notes Section */}
          <div className="space-y-3 pt-2">
            <span className="text-metadata font-bold text-secondary uppercase tracking-wider block">
              Therapist Clinical Notes
            </span>

            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="p-3 bg-white rounded-card-sm border border-border-subtle text-caption text-primary">
                  <div className="flex items-center justify-between text-metadata text-secondary pb-1">
                    <span className="font-semibold text-forest">{n.therapistName}</span>
                    <span>{n.date}</span>
                  </div>
                  <p className="mt-0.5">"{n.content}"</p>
                </div>
              ))}
            </div>

            {/* Add note field */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter clinical observation..."
                className="flex-1 px-3.5 py-2.5 rounded-input border border-border-subtle bg-white text-caption text-primary focus:outline-none focus:border-forest"
              />
              <Button
                variant="primary"
                size="default"
                disabled={isSubmittingNote || !newNoteText.trim()}
                onClick={handleAddNote}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Note
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Adjust Program Sheet */}
      <BottomSheet
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Program: ${selectedPatient?.name}`}
      >
        <div className="space-y-4 py-1 text-left select-none">
          <p className="text-caption text-secondary">
            Update target joint angles, repetitions, and allowable pain threshold. Changes reach patient's mobile app on their next session.
          </p>

          <PainSlider
            value={adjustedPain}
            onChange={setAdjustedPain}
            label="Maximum Allowable Pain Threshold (Stops if exceeded)"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-metadata font-bold text-secondary uppercase tracking-wider block">
                Target ROM (Degrees)
              </label>
              <input
                type="number"
                value={adjustedRom}
                onChange={(e) => setAdjustedRom(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-input border border-border-subtle bg-white font-bold text-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-metadata font-bold text-secondary uppercase tracking-wider block">
                Target Repetitions
              </label>
              <input
                type="number"
                value={adjustedReps}
                onChange={(e) => setAdjustedReps(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-input border border-border-subtle bg-white font-bold text-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-metadata font-bold text-secondary uppercase tracking-wider block">
              Movement Guidance Note
            </label>
            <textarea
              rows={3}
              value={guidanceNoteInput}
              onChange={(e) => setGuidanceNoteInput(e.target.value)}
              className="w-full p-3 rounded-input border border-border-subtle bg-white text-caption text-primary focus:outline-none focus:border-forest"
            />
          </div>

          <Button variant="primary" size="full" onClick={handleSaveProgram}>
            Save & Sync to Patient Device
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
