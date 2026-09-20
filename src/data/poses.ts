export interface YogaPose {
  id: string;
  name: string;
  sanskrit: string;
  category: 'standing' | 'balance' | 'seated' | 'floor';
  durationSeconds: number;
  difficulty: 'Beginner' | 'Intermediate';
  description: string;
  breathing: {
    inhaleSec: number;
    holdSec: number;
    exhaleSec: number;
    cue: string;
  };
  alignmentTips: [string, string, string];
  keyJoints: string[];
  svgType: 'mountain' | 'tree' | 'warrior2' | 'chair' | 'triangle' | 'catcow' | 'child' | 'downward_dog';
  mode: 'hold';
  previewOnly?: boolean;
}

export const YOGA_POSES: YogaPose[] = [
  {
    id: 'warrior-2',
    name: 'Warrior II',
    sanskrit: 'Virabhadrasana II',
    category: 'standing',
    durationSeconds: 45,
    difficulty: 'Beginner',
    mode: 'hold',
    previewOnly: false,
    description: 'A powerful standing pose that cultivates focus, grounded stability, and hip opening.',
    breathing: {
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 4,
      cue: 'Inhale to expand the chest; exhale to sink gently into the front knee.',
    },
    alignmentTips: [
      'Keep front knee stacked directly over the ankle, pointing forward.',
      'Soften shoulders down away from ears with arms level with the horizon.',
      'Maintain equal weight pressing through both feet, torso centered.',
    ],
    keyJoints: ['Front Knee 90°', 'Shoulders Level 180°', 'Vertical Spine 90°'],
    svgType: 'warrior2',
  },
  {
    id: 'tree-pose',
    name: 'Tree Pose',
    sanskrit: 'Vrikshasana',
    category: 'balance',
    durationSeconds: 40,
    difficulty: 'Beginner',
    mode: 'hold',
    previewOnly: true,
    description: 'An elegant balancing pose establishing rooted poise, ankle strength, and mental calm.',
    breathing: {
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 4,
      cue: 'Inhale feeling length through the crown of your head; exhale rooting down.',
    },
    alignmentTips: [
      'Place foot on calf or inner thigh—never directly against the knee joint.',
      'Fix your gaze on an unmoving point at eye level to support balance.',
      'Keep hips square to the front with hands centered at the chest.',
    ],
    keyJoints: ['Standing Leg 180°', 'Open Hip 45°', 'Hands at Heart'],
    svgType: 'tree',
  },
  {
    id: 'mountain-pose',
    name: 'Mountain Pose',
    sanskrit: 'Tadasana',
    category: 'standing',
    durationSeconds: 60,
    difficulty: 'Beginner',
    mode: 'hold',
    previewOnly: true,
    description: 'The foundational posture of all standing poses, restoring natural spinal alignment.',
    breathing: {
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 4,
      cue: 'Slow, rhythmic breaths while feeling the feet ground into the earth.',
    },
    alignmentTips: [
      'Distribute weight evenly across all four corners of each foot.',
      'Gently engage thigh muscles and lift kneecaps without locking knees.',
      'Draw the shoulder blades down and relax the facial muscles.',
    ],
    keyJoints: ['Neutral Pelvis', 'Spine Lengthened', 'Relaxed Shoulders'],
    svgType: 'mountain',
  },
  {
    id: 'chair-pose',
    name: 'Chair Pose',
    sanskrit: 'Utkatasana',
    category: 'standing',
    durationSeconds: 30,
    difficulty: 'Beginner',
    mode: 'hold',
    previewOnly: true,
    description: 'Invigorates the thighs and spine while activating core stability and calf strength.',
    breathing: {
      inhaleSec: 3,
      holdSec: 1,
      exhaleSec: 4,
      cue: 'Inhale raising arms along the ears; exhale sinking hips back as if into a chair.',
    },
    alignmentTips: [
      'Keep knees parallel and aligned behind the toes.',
      'Draw navel gently toward spine to support the lumbar curve.',
      'Lengthen through fingertips without hunching shoulders.',
    ],
    keyJoints: ['Knee Flexion 75°', 'Torso Lean 45°', 'Arms Raised'],
    svgType: 'chair',
  },
  {
    id: 'triangle-pose',
    name: 'Triangle Pose',
    sanskrit: 'Trikonasana',
    category: 'standing',
    durationSeconds: 45,
    difficulty: 'Intermediate',
    mode: 'hold',
    previewOnly: true,
    description: 'Lengthens the hamstrings, expands ribcage capacity, and stimulates digestive organs.',
    breathing: {
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 4,
      cue: 'Inhale to elongate the side ribs; exhale extending spine over the front leg.',
    },
    alignmentTips: [
      'Both legs straight without hyper-extending the front knee.',
      'Stack top shoulder directly over the bottom shoulder.',
      'Keep both sides of the torso equally long; do not collapse downward.',
    ],
    keyJoints: ['Straight Front Leg 180°', 'Arms Perpendicular 180°', 'Open Torso'],
    svgType: 'triangle',
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Flow',
    sanskrit: 'Marjaryasana-Bitilasana',
    category: 'floor',
    durationSeconds: 60,
    difficulty: 'Beginner',
    mode: 'hold',
    previewOnly: true,
    description: 'Gentle spinal wave movement warming every vertebra and releasing neck and back tension.',
    breathing: {
      inhaleSec: 4,
      holdSec: 1,
      exhaleSec: 4,
      cue: 'Inhale to arch and lift the gaze (Cow); exhale to round the spine up (Cat).',
    },
    alignmentTips: [
      'Wrists directly under shoulders; knees directly under hips.',
      'Initiate movement from the tailbone, letting the head follow naturally.',
      'Press firmly into knuckles and palms to protect the wrists.',
    ],
    keyJoints: ['Spinal Flexion/Extension', 'Shoulders Over Wrists 90°', 'Hips Over Knees 90°'],
    svgType: 'catcow',
  },
  {
    id: 'child-pose',
    name: "Child's Pose",
    sanskrit: 'Balasana',
    category: 'floor',
    durationSeconds: 90,
    difficulty: 'Beginner',
    mode: 'hold',
    previewOnly: true,
    description: 'A deeply restorative sanctuary posture calming the nervous system and easing lower back strain.',
    breathing: {
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 5,
      cue: 'Breathe deeply into the back ribs, feeling the belly rest on or between thighs.',
    },
    alignmentTips: [
      'Big toes touch; knees can be together or wide to comfortable hip distance.',
      'Rest forehead gently on the mat, relaxing the jaw and throat.',
      'Extend arms softly forward or let them drape alongside the legs.',
    ],
    keyJoints: ['Full Hip Fold', 'Relaxed Cervical Spine', 'Grounded Sacrum'],
    svgType: 'child',
  },
  {
    id: 'downward-dog',
    name: 'Downward-Facing Dog',
    sanskrit: 'Adho Mukha Svanasana',
    category: 'floor',
    durationSeconds: 50,
    difficulty: 'Beginner',
    mode: 'hold',
    previewOnly: true,
    description: 'An energizing full-body inversion stretching calves, hamstrings, and shoulders.',
    breathing: {
      inhaleSec: 4,
      holdSec: 1,
      exhaleSec: 4,
      cue: 'Inhale pressing hips up and back; exhale gently grounding heels toward the mat.',
    },
    alignmentTips: [
      'Hands shoulder-width apart with fingers spread wide like starfishes.',
      'Prioritize a straight, long spine—bend knees as much as needed.',
      'Roll shoulder heads outwards to create ample space for the neck.',
    ],
    keyJoints: ['Hip Inversion 70°', 'Long Lumbar Spine', 'Shoulder Angle 160°'],
    svgType: 'downward_dog',
  },
];
