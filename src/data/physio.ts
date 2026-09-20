export interface PhysioExercise {
  id: string;
  name: string;
  targetArea: string;
  defaultReps: string;
  done: boolean;
  guidance: string;
  focusPoint: string;
  contraindications: string;
  mode?: 'reps' | 'hold';
  previewOnly?: boolean;
}

export interface PhysioProgram {
  id: string;
  title: string;
  subtitle: string;
  currentWeek: number;
  totalWeeks: number;
  completionPercent: number;
  status: 'On track' | 'Needs review' | 'Recovering';
  assignedBy: string;
  exercises: PhysioExercise[];
}

export const PHYSIO_PROGRAMS: Record<string, PhysioProgram> = {
  'shoulder-mobility': {
    id: 'shoulder-mobility',
    title: 'Shoulder Mobility & Stability',
    subtitle: 'Clinical Scapulohumeral Rhythm Rehab',
    currentWeek: 3,
    totalWeeks: 6,
    completionPercent: 78,
    status: 'On track',
    assignedBy: 'Dr. Anita Desai, PT',
    exercises: [
      {
        id: 'wall-slide',
        name: 'Wall Slides with Forearm Glide',
        targetArea: 'Serratus anterior & lower trapezius',
        defaultReps: '3 sets of 10 glides',
        done: true,
        mode: 'reps',
        previewOnly: false,
        guidance: 'Place forearms on the wall with towel or foam roller. Glide upward without shrugging shoulders.',
        focusPoint: 'Feel the shoulder blades slide smoothly around the ribcage.',
        contraindications: 'Stop if sharp pinching occurs at the top of the shoulder.',
      },
      {
        id: 'shoulder-rotation',
        name: 'Supported External Shoulder Rotation',
        targetArea: 'Infraspinatus & teres minor',
        defaultReps: '3 sets of 12 reps',
        done: true,
        guidance: 'Keep elbow pinned gently to ribs with a folded towel. Rotate forearm outward with control.',
        focusPoint: 'Smooth, fluid outward rotation without leaning the upper body.',
        contraindications: 'Do not fling or jerk the forearm outward.',
      },
      {
        id: 'scapular-retraction',
        name: 'Scapular Retractions (Pinch & Hold)',
        targetArea: 'Rhomboids & mid-trapezius',
        defaultReps: '2 sets of 12 reps (3s hold)',
        done: false,
        guidance: 'Sit tall with elbows relaxed. Squeeze shoulder blades together as if holding a pencil.',
        focusPoint: 'Pinch shoulder blades back and down, keeping the neck long.',
        contraindications: 'Avoid arching your lower back or craning your neck forward.',
      },
      {
        id: 'cross-body-stretch',
        name: 'Posterior Capsule Shoulder Stretch',
        targetArea: 'Posterior shoulder capsule',
        defaultReps: '3 holds of 30 seconds',
        done: false,
        guidance: 'Gently draw the arm across your chest using the opposite hand. Breathe smoothly.',
        focusPoint: 'A mild, pleasant tension across the back of the shoulder joint.',
        contraindications: 'Do not pull abruptly across the joint.',
      },
    ],
  },
  'knee-strength': {
    id: 'knee-strength',
    title: 'Knee Strength & Alignment',
    subtitle: 'Patellofemoral Tracking & Quad Recovery',
    currentWeek: 1,
    totalWeeks: 4,
    completionPercent: 25,
    status: 'On track',
    assignedBy: 'Dr. Anita Desai, PT',
    exercises: [
      {
        id: 'knee-extension',
        name: 'Terminal Knee Extensions (TKE)',
        targetArea: 'Vastus medialis oblique (VMO)',
        defaultReps: '3 sets of 15 reps',
        done: true,
        guidance: 'Stand with light resistance behind knee. Straighten knee fully against gentle tension.',
        focusPoint: 'Lock out comfortably with deliberate quad contraction.',
        contraindications: 'Avoid hyper-extending violently backwards.',
      },
      {
        id: 'box-squat',
        name: 'Supported Chair / Box Squat',
        targetArea: 'Glutes, quads & hamstrings',
        defaultReps: '3 sets of 8 reps',
        done: false,
        guidance: 'Hips push back first toward the chair. Knees track in line with 2nd and 3rd toes.',
        focusPoint: 'Keep knees behind toes and weight rooted through the midfoot.',
        contraindications: 'Do not let knees cave inward toward each other.',
      },
      {
        id: 'hip-hinge',
        name: 'Assisted Hip Hinge (Posterior Chain)',
        targetArea: 'Hamstrings & gluteus maximus',
        defaultReps: '3 sets of 10 reps',
        done: false,
        guidance: 'Soft bend in knees. Hinge hips backwards toward the wall while maintaining neutral spine.',
        focusPoint: 'Feel gentle hamstring stretch; spine remains tall and supported.',
        contraindications: 'Stop if lower back rounds.',
      },
    ],
  },
};
