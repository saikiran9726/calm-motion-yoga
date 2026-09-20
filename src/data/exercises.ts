export interface ExerciseThresholds {
  upper?: number;
  lower?: number;
  targetAngle?: number;
  tolerance?: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'yoga' | 'physio' | 'mobility';
  durationMin: number;
  reps: number;
  description: string;
  guidance: string;
  mode: 'hold' | 'reps';
  thresholds?: ExerciseThresholds;
  previewOnly?: boolean;
}

export const initialExercises: ExerciseItem[] = [
  {
    id: 'warrior-2',
    name: 'Warrior II (Virabhadrasana II)',
    category: 'yoga',
    durationMin: 3,
    reps: 30, // 30 seconds target hold
    description: 'Deep lunge focusing on hip opening and shoulder leveling.',
    guidance: 'Keep shoulders relaxed down away from ears and torso centered.',
    mode: 'hold',
    thresholds: { targetAngle: 90, tolerance: 20 },
    previewOnly: false,
  },
  {
    id: 'wall-slide',
    name: 'Wall Slides with Scapular Retraction',
    category: 'physio',
    durationMin: 4,
    reps: 10,
    description: 'Controlled shoulder flexion with forearms against the wall.',
    guidance: 'Maintain light core engagement; do not arch lower back.',
    mode: 'reps',
    thresholds: { upper: 130, lower: 75 },
    previewOnly: false,
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Spinal Flow',
    category: 'mobility',
    durationMin: 3,
    reps: 8,
    description: 'Synchronized spinal flexion and extension with breathing.',
    guidance: 'Inhale to softly arch, exhale to round spine towards ceiling.',
    mode: 'reps',
    previewOnly: true,
  },
];
