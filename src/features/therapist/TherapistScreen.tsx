import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Stethoscope, CheckCircle, AlertTriangle, Clock, Sliders } from 'lucide-react';
import { Card, Button, ProgressRing, PainSlider, BottomSheet } from '@/components/ui';

interface Patient {
  id: string;
  name: string;
  condition: string;
  status: 'on_track' | 'missed' | 'review';
  statusLabel: string;
  recoveryPct: number;
  adherencePct: number;
  painTrend: number; // 0-10
  lastSession: string;
}

export const TherapistScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const patients: Patient[] = [
    {
      id: '1',
      name: 'Arjun Verma',
      condition: 'Shoulder Rehab (Impingement)',
      status: 'on_track',
      statusLabel: 'On track',
      recoveryPct: 82,
      adherencePct: 90,
      painTrend: 2,
      lastSession: 'Today, 9:30 AM',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      condition: 'Knee Post-Op (ACL Tier 2)',
      status: 'missed',
      statusLabel: 'Missed sessions',
      recoveryPct: 45,
      adherencePct: 52,
      painTrend: 5,
      lastSession: '3 days ago',
    },
    {
      id: '3',
      name: 'Rahul Sen',
      condition: 'Lumbar Spine Mobility',
      status: 'review',
      statusLabel: 'Needs review',
      recoveryPct: 64,
      adherencePct: 75,
      painTrend: 4,
      lastSession: 'Yesterday, 5:15 PM',
    },
  ];

  const [selectedPatient, setSelectedPatient] = useState<Patient>(patients[0]);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustedPain, setAdjustedPain] = useState(selectedPatient.painTrend);

  return (
    <div className="p-5 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-primary hover:bg-forest/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-metadata font-bold text-forest bg-sage/60 px-3 py-1 rounded-pill flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4" />
          {t('therapist.badge', 'Clinical Therapist Portal')}
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-heading font-bold text-primary">
          {t('therapist.greeting', 'Good morning, Dr. Anita')}
        </h1>
        <p className="text-caption text-secondary">
          {t('therapist.activePatients', '12 active patients')} under care
        </p>
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
          Patient Cohort
        </span>

        {patients.map((p) => {
          const isSelected = selectedPatient.id === p.id;
          return (
            <Card
              key={p.id}
              interactive
              onClick={() => {
                setSelectedPatient(p);
                setAdjustedPain(p.painTrend);
              }}
              className={`p-4 transition-all ${
                isSelected
                  ? 'border-forest/40 bg-sage/15 shadow-soft ring-1 ring-forest/20'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-body-medium font-bold text-primary">{p.name}</h3>
                  <p className="text-metadata text-secondary">{p.condition}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-metadata font-bold px-2.5 py-1 rounded-pill flex items-center gap-1 ${
                      p.status === 'on_track'
                        ? 'bg-sage text-forest'
                        : p.status === 'missed'
                        ? 'bg-coral-light text-coral-dark'
                        : 'bg-sand text-primary'
                    }`}
                  >
                    {p.status === 'on_track' && <CheckCircle className="w-3.5 h-3.5" />}
                    {p.status === 'missed' && <Clock className="w-3.5 h-3.5" />}
                    {p.status === 'review' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {p.statusLabel}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Patient Detail View */}
      <Card variant="default" className="p-5 space-y-4 border-t-4 border-t-forest">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-metadata text-secondary">Active Patient Record</span>
            <h2 className="text-title font-bold text-primary">{selectedPatient.name}</h2>
            <p className="text-caption text-forest font-medium">{selectedPatient.condition}</p>
          </div>
          <ProgressRing value={selectedPatient.recoveryPct} size={64} strokeWidth={6}>
            <span className="text-caption-medium font-bold text-forest">
              {selectedPatient.recoveryPct}%
            </span>
          </ProgressRing>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-forest/5 rounded-card-sm p-3">
            <span className="text-metadata text-secondary block">Adherence Rate</span>
            <span className="text-title font-bold text-primary">
              {selectedPatient.adherencePct}%
            </span>
          </div>

          <div className="bg-forest/5 rounded-card-sm p-3">
            <span className="text-metadata text-secondary block">Pain Trend (0-10)</span>
            <span className="text-title font-bold text-forest">
              Level {selectedPatient.painTrend}
            </span>
          </div>
        </div>

        <div className="text-metadata text-secondary pt-1 flex items-center justify-between">
          <span>Last Recorded Session:</span>
          <span className="font-semibold text-primary">{selectedPatient.lastSession}</span>
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="full"
            leftIcon={<Sliders className="w-4 h-4" />}
            onClick={() => setAdjustModalOpen(true)}
          >
            {t('therapist.adjustProgram', 'Adjust Program')}
          </Button>
        </div>
      </Card>

      {/* Adjust Program Sheet */}
      <BottomSheet
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Program: ${selectedPatient.name}`}
      >
        <div className="space-y-4 py-1">
          <p className="text-caption text-secondary">
            Update target joint angles, repetitions, and allowable pain threshold for {selectedPatient.name}.
          </p>

          <PainSlider
            value={adjustedPain}
            onChange={setAdjustedPain}
            label="Maximum Allowable Pain Threshold"
          />

          <div className="space-y-2">
            <label className="text-metadata font-semibold text-secondary uppercase tracking-wider block">
              Movement Target Guidance
            </label>
            <div className="p-3.5 bg-forest/5 rounded-input border border-border-subtle text-caption text-primary">
              "Focus on scapular retraction without elevating the right trapezius. Stop at 90 degrees if discomfort occurs."
            </div>
          </div>

          <Button
            variant="primary"
            size="full"
            onClick={() => {
              setSelectedPatient((prev) => ({ ...prev, painTrend: adjustedPain }));
              setAdjustModalOpen(false);
            }}
          >
            Save Protocol Updates
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
