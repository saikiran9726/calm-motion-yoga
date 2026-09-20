import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Settings,
  Sparkles,
  Bell,
  Trash2,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { Card, Button, BottomSheet } from '@/components/ui';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAppStore } from '@/lib/store';
import { db, getPatientIdentity, savePatientIdentity, clearPatientIdentity, PatientProfileRecord } from '@/lib/db';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    userName,
    setUserName,
    userGoal,
    cameraPermission,
    setCameraPermission,
    resetAllData,
    addToast
  } = useAppStore();

  const [patientIdentity, setPatientIdentity] = useState<PatientProfileRecord | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinNameInput, setJoinNameInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    getPatientIdentity().then((ident) => {
      setPatientIdentity(ident);
      if (ident && !userName && ident.patientId) {
        // keep patient state intact
      }
    });
    if (userName) {
      setJoinNameInput(userName);
    }
  }, [userName]);

  const handleJoinClinic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    const nameToUse = joinNameInput.trim() || userName.trim() || 'Patient';
    if (!code) {
      setJoinError('Please enter a clinic code (e.g. CALM01)');
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      const res = await fetch('/api/patient/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicCode: code,
          name: nameToUse,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setJoinError(data.error || 'Failed to join clinic. Please check code.');
        setIsJoining(false);
        return;
      }

      const newProfile: Omit<PatientProfileRecord, 'id'> = {
        patientId: data.patient.id,
        patientToken: data.patientToken,
        clinicCode: data.patient.clinicCode,
        clinicName: 'Apex Physical Therapy Clinic',
        joinedAt: new Date().toISOString(),
      };
      await savePatientIdentity(newProfile);
      setPatientIdentity({ ...newProfile, id: 'current' });
      setUserName(nameToUse);
      setJoinCodeInput('');
      addToast({
        title: 'Joined clinic successfully',
        description: `Connected to clinic ${data.patient.clinicCode}. Your recovery program will now sync.`,
        type: 'success',
      });
    } catch (err: any) {
      setJoinError(err.message || 'Network error while joining clinic');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClinic = async () => {
    await clearPatientIdentity();
    await db.cachedProgram.clear();
    setPatientIdentity(null);
    addToast({
      title: 'Disconnected from clinic',
      description: 'Switched to independent on-device mode. Outbox reports will remain local.',
      type: 'info',
    });
  };

  const handleDeleteData = async () => {
    const identity = await getPatientIdentity();
    if (identity && identity.patientToken) {
      try {
        const res = await fetch('/api/patient/delete-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${identity.patientToken}`,
          },
          body: JSON.stringify({ patientId: identity.patientId }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          addToast({
            title: 'Cloud purge failed',
            description: errData.error || 'Could not verify patient credentials on server. Local data preserved.',
            type: 'warning',
          });
          setDeleteConfirmOpen(false);
          return;
        }
      } catch {
        addToast({
          title: 'Network error',
          description: 'Could not contact clinic server to purge records. Local data preserved so you can retry.',
          type: 'warning',
        });
        setDeleteConfirmOpen(false);
        return;
      }
    }

    // Only clear local Dexie and identity after cloud purge succeeds (or if not joined)
    resetAllData();
    try {
      await db.sessions.clear();
      await db.painLogs.clear();
      await db.outbox.clear();
      await db.cachedProgram.clear();
      await clearPatientIdentity();
      setPatientIdentity(null);
    } catch (e) {
      console.warn('Local purge warning:', e);
    }
    setDeleteConfirmOpen(false);
    addToast({
      title: 'All data permanently deleted',
      description: 'On-device sessions, pain logs, and cloud clinic records have been completely purged.',
      type: 'info',
    });
  };

  return (
    <div className="p-5 pb-32 space-y-6 select-none bg-offwhite min-h-screen">
      {/* 1. Photo placeholder, Name, Goals */}
      {(() => {
        const userInitials = (userName || (import.meta.env.VITE_DEMO_MODE === 'true' ? 'Demo Patient' : 'Patient'))
          .trim()
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'P';

        const displayName = userName || (import.meta.env.VITE_DEMO_MODE === 'true' ? 'Demo Patient' : 'Patient');

        return (
          <div className="flex items-center gap-4 pt-1">
            <div className="w-16 h-16 rounded-full bg-forest text-offwhite flex items-center justify-center font-bold text-heading shadow-soft border-2 border-sage">
              {userInitials}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <h1 className="text-title font-bold text-primary">{displayName}</h1>
                {/* Offline status badge */}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest bg-sage/60 px-2 py-0.5 rounded-pill">
                  <WifiOff className="w-3 h-3" /> Offline Ready
                </span>
              </div>
              <p className="text-caption text-secondary">
                Focus: {userGoal === 'both' ? 'Yoga Flow & Shoulder Rehab' : userGoal === 'yoga' ? 'Mindful Yoga' : 'Clinical Physiotherapy'}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary pt-0.5">
                <Sparkles className="w-3 h-3 text-forest" /> Active Member • On-Device Storage
              </span>
            </div>
          </div>
        );
      })()}

      {/* 2. Current Active Programs Card */}
      <div className="space-y-2">
        <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
          Current Programs
        </span>

        <Card
          variant="sage"
          interactive
          onClick={() => navigate('/physio/recovery')}
          className="p-4 rounded-[22px] space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-metadata font-bold text-forest uppercase tracking-wider">
              Physiotherapy Track
            </span>
            <span className="text-[11px] font-bold text-forest bg-white/80 px-2 py-0.5 rounded-pill">
              Week 3 of 6
            </span>
          </div>
          <h3 className="text-body-medium font-bold text-primary">
            Shoulder Mobility & Stability
          </h3>
          <div className="flex items-center justify-between text-metadata text-secondary pt-1">
            <span>78% completed</span>
            <span className="text-forest font-bold inline-flex items-center">
              View Recovery <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Connected Clinic & Therapist */}
      <div className="space-y-2">
        <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
          Supervising Clinic
        </span>

        {patientIdentity ? (
          <Card variant="default" className="p-4 rounded-card shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-sage flex items-center justify-center text-forest shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-body-medium font-bold text-primary">Dr. Anita Desai, PT</h4>
                  <p className="text-metadata text-secondary">Apex Physical Therapy Clinic</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-pill bg-forest text-white text-[11px] font-mono font-bold">
                {patientIdentity.clinicCode}
              </span>
            </div>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-metadata text-secondary">
              <span className="font-mono text-[11px]">
                ID: {patientIdentity.patientId.slice(0, 14)}…
              </span>
              <button
                type="button"
                onClick={handleLeaveClinic}
                className="text-coral-dark hover:underline font-semibold flex items-center gap-1 text-[11px]"
              >
                <LogOut className="w-3 h-3" />
                Leave clinic
              </button>
            </div>
          </Card>
        ) : (
          <Card variant="default" className="p-4 rounded-card shadow-card space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-body-medium font-bold text-primary">Not connected to a clinic</h4>
                <span className="text-[10px] font-semibold text-secondary bg-sand/60 px-2 py-0.5 rounded-pill">
                  Local Mode
                </span>
              </div>
              <p className="text-caption text-secondary">
                Your practice reports stay local on this phone. Enter your clinic code from your therapist to sync session data.
              </p>
            </div>

            <form onSubmit={handleJoinClinic} className="space-y-2.5 pt-1">
              <div>
                <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
                  Clinic Code
                </label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. CALM01"
                  className="w-full px-3.5 py-2.5 rounded-input border border-border-subtle bg-white text-primary text-body focus:outline-none focus:ring-2 focus:ring-forest/20 uppercase font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={joinNameInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinNameInput(e.target.value)}
                  placeholder="e.g. Your Name"
                  className="w-full px-3.5 py-2.5 rounded-input border border-border-subtle bg-white text-primary text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              {joinError && (
                <p className="text-caption text-coral-dark font-medium">{joinError}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="default"
                className="w-full font-bold"
                disabled={isJoining}
              >
                {isJoining ? 'Connecting…' : 'Connect to Clinic'}
              </Button>
            </form>
          </Card>
        )}
      </div>

      {/* 4. Preferences & Settings List */}
      <div className="space-y-2">
        <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
          Preferences & Controls
        </span>

        <Card variant="default" className="p-0 divide-y divide-border-subtle shadow-card rounded-card overflow-hidden">
          {/* Language Switcher */}
          <div className="p-4 flex items-center justify-between min-h-[56px]">
            <span className="text-caption-medium text-primary font-medium">Language</span>
            <LanguageSwitcher />
          </div>

          {/* Gentle Daily Reminder Toggle */}
          <div className="p-4 flex items-center justify-between min-h-[56px]">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-forest" />
              <span className="text-caption-medium text-primary font-medium">
                Morning Practice Reminder
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setNotificationsEnabled(!notificationsEnabled);
                addToast({
                  title: notificationsEnabled ? 'Notifications silenced' : 'Daily reminder enabled',
                  type: 'info',
                });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-fast cursor-pointer ${
                notificationsEnabled ? 'bg-forest' : 'bg-forest/20'
              }`}
              aria-label="Toggle notifications"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-fast shadow-soft ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Camera Permissions & Privacy */}
          <div
            className="p-4 flex items-center justify-between min-h-[56px] cursor-pointer hover:bg-forest/5 transition-colors"
            onClick={() => setPrivacyModalOpen(true)}
          >
            <div className="flex items-center gap-3">
              <Camera className="w-4 h-4 text-forest" />
              <div>
                <span className="text-caption-medium text-primary font-medium block">
                  Camera Permissions & Privacy
                </span>
                <span className="text-metadata text-secondary block">
                  Status: {cameraPermission === 'granted' ? 'Allowed (On-Device)' : 'Not active'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-secondary" />
          </div>

          {/* Replay Onboarding */}
          <div
            className="p-4 flex items-center justify-between min-h-[56px] cursor-pointer hover:bg-forest/5 transition-colors"
            onClick={() => navigate('/onboarding')}
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-forest" />
              <span className="text-caption-medium text-primary font-medium">
                Replay Onboarding Setup
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-secondary" />
          </div>

          {/* Design System Reference */}
          <div
            className="p-4 flex items-center justify-between min-h-[56px] cursor-pointer hover:bg-forest/5 transition-colors"
            onClick={() => navigate('/design')}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-forest" />
              <span className="text-caption-medium text-primary font-medium">
                Design System Catalog
              </span>
            </div>
            <span className="text-metadata text-forest font-semibold bg-sage/60 px-2 py-0.5 rounded-pill">
              /design
            </span>
          </div>

          {/* About This Prototype */}
          <div
            className="p-4 flex items-center justify-between min-h-[56px] cursor-pointer hover:bg-forest/5 transition-colors"
            onClick={() => navigate('/about')}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-forest" />
              <span className="text-caption-medium text-primary font-medium">
                About This Prototype (Evaluator Info)
              </span>
            </div>
            <span className="text-metadata text-forest font-semibold bg-sage/60 px-2 py-0.5 rounded-pill">
              /about
            </span>
          </div>

          {/* Clinic Supervision Portal */}
          <div
            className="p-4 flex items-center justify-between min-h-[56px] cursor-pointer hover:bg-forest/5 transition-colors"
            onClick={() => navigate('/clinic')}
          >
            <div className="flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-forest" />
              <span className="text-caption-medium text-primary font-medium">
                Clinic Supervision Dashboard
              </span>
            </div>
            <span className="text-metadata text-forest font-semibold bg-sage/60 px-2 py-0.5 rounded-pill">
              /clinic
            </span>
          </div>

          {/* Privacy: Delete All My Data */}
          <div
            className="p-4 flex items-center justify-between min-h-[56px] cursor-pointer hover:bg-coral-light/20 transition-colors"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-coral-dark" />
              <span className="text-caption-medium text-coral-dark font-medium">
                Delete all my data
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-secondary" />
          </div>
        </Card>
      </div>

      {/* Camera Privacy BottomSheet */}
      <BottomSheet
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Camera & Privacy Guarantee"
      >
        <div className="space-y-4 py-1 select-none">
          <div className="p-3.5 bg-sage/30 rounded-card-sm border border-sage/50 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-forest shrink-0" />
            <p className="text-caption text-secondary">
              Video is evaluated in real time within browser memory. No camera frames are stored, exported, or sent to any server.
            </p>
          </div>

          <div className="space-y-2 text-caption text-secondary">
            <p>• <strong>Works completely offline</strong> without an active data connection.</p>
            <p>• <strong>Revoke permission:</strong> You can turn off camera access in your device/browser settings at any time.</p>
          </div>

          <Button
            variant="primary"
            size="full"
            onClick={() => {
              setCameraPermission('granted');
              setPrivacyModalOpen(false);
            }}
          >
            Keep Camera Enabled
          </Button>
        </div>
      </BottomSheet>

      {/* Delete Data Confirmation BottomSheet */}
      <BottomSheet
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete All Local Data?"
      >
        <div className="space-y-4 py-1 select-none">
          <div className="p-3.5 bg-coral-light/30 rounded-card-sm border border-coral/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-coral-dark shrink-0 mt-0.5" />
            <p className="text-caption text-secondary">
              This will permanently delete your session streaks, pain self-assessments, and exercise completion history from this phone.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              variant="coral"
              size="full"
              onClick={handleDeleteData}
            >
              Yes, Delete All My Data
            </Button>
            <Button
              variant="ghost"
              size="full"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
