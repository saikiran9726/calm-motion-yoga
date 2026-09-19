import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

export const AboutScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-5 pb-32 space-y-6 select-none bg-offwhite min-h-screen max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-primary hover:bg-forest/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-metadata font-bold text-forest bg-sage/60 px-3 py-1 rounded-pill flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Prototype Transparency
        </span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-display font-bold text-primary tracking-tight">
          About This Prototype
        </h1>
        <p className="text-caption text-secondary">
          An honest, transparent engineering breakdown of what is fully functional and current prototype boundaries.
        </p>
      </div>

      {/* 1. What is 100% Real & Working */}
      <Card variant="default" className="p-5 space-y-3.5 border-t-4 border-t-forest shadow-card">
        <div className="flex items-center gap-2 text-forest">
          <CheckCircle2 className="w-5 h-5" />
          <h2 className="text-body-medium font-bold">What is Real & Working Today</h2>
        </div>

        <ul className="space-y-2.5 text-caption text-primary">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>100% On-Device Privacy:</strong> Camera frames are processed strictly in browser memory on the user's phone. No video, images, or biometric face/body data are ever sent over the network or stored.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>One-Correction-at-a-Time Controller:</strong> Debounced feedback guarantees minimum 1.5s on screen, highlights only the relevant joint in soft coral, and never uses color alone (always icon + text + vibration).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>Live Range of Motion (ROM):</strong> Real-time joint angle trigonometry computing current angle and session peak ROM.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>Multilingual Voice Engine:</strong> Calibrated speech coaching in English, Hindi, and Telugu with deliberate cadence and pause respect.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>Clinical Pain-Stop Safety Rule:</strong> Automatically halts workout if user discomfort reaches level 5 or above to safeguard vulnerable joints.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>Offline-First Architecture & Outbox:</strong> Service worker precaching and Dexie IndexedDB outbox queue that retains session reports in airplane mode and auto-syncs when reconnected.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>Clinic Supervision Portal (`/clinic`):</strong> Live 5s polling, patient cohort tracking, program adjustments, clinical notes, and demo seeding.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0 mt-2" />
            <span><strong>Clinical Session PDF:</strong> Instant vector PDF generation summarising reps, ROM, pain scores, and therapist guidance.</span>
          </li>
        </ul>
      </Card>

      {/* 2. Honest Current Limitations */}
      <Card variant="sand" className="p-5 space-y-3.5 border border-sand/70 shadow-card">
        <div className="flex items-center gap-2 text-primary">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-body-medium font-bold">Current Prototype Boundaries</h2>
        </div>

        <ul className="space-y-2.5 text-caption text-secondary">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
            <span><strong>Browser TTS Voice Accents:</strong> Web Speech API relies on the host OS voices. Hindi and Telugu synthesized voices sound natural on devices with installed language packs, but fall back to the closest regional voice on older desktop browsers.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
            <span><strong>Web Platform vs Native NPU:</strong> Browsers execute model inference via WebGL shaders rather than dedicated device NPUs (Apple Neural Engine / Qualcomm NPU), resulting in slightly higher battery usage during prolonged continuous live sessions.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
            <span><strong>Adjuvant Tool, Not Medical Diagnosis:</strong> Calm Motion provides movement guidance and alignment checks. It is designed to assist licensed physical therapists and cannot provide medical diagnoses or replace clinical care.</span>
          </li>
        </ul>
      </Card>

      {/* Quick Access to Key Experiences */}
      <div className="space-y-2 pt-2">
        <Button
          variant="coral"
          size="full"
          onClick={() => navigate('/session')}
        >
          Try Live Motion Coach
        </Button>
        <Button
          variant="secondary"
          size="full"
          onClick={() => navigate('/clinic')}
        >
          Open Clinic Supervision Portal
        </Button>
      </div>
    </div>
  );
};
