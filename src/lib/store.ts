import { create } from 'zustand';

export type BodyFeeling = 'great' | 'okay' | 'sore' | null;
export type UserGoal = 'yoga' | 'physio' | 'both';
export type CameraPermissionState = 'prompt' | 'granted' | 'denied';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

interface AppState {
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  userGoal: UserGoal;
  setUserGoal: (goal: UserGoal) => void;
  cameraPermission: CameraPermissionState;
  setCameraPermission: (perm: CameraPermissionState) => void;

  todayFeeling: BodyFeeling;
  setTodayFeeling: (feeling: BodyFeeling) => void;
  painScore: number;
  setPainScore: (score: number) => void;

  activePhysioProgramId: string;
  setActivePhysioProgramId: (id: string) => void;
  physioChecklist: Record<string, boolean>;
  togglePhysioExercise: (id: string) => void;

  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;

  resetAllData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: true, // Default to true so standard tabs can be viewed, but accessible via /onboarding
  setIsOnboarded: (val) => set({ isOnboarded: val }),
  userName: import.meta.env.VITE_DEMO_MODE === 'true' ? 'Ananya' : '',
  setUserName: (name) => set({ userName: name }),
  userGoal: 'both',
  setUserGoal: (goal) => set({ userGoal: goal }),
  cameraPermission: 'prompt',
  setCameraPermission: (perm) => set({ cameraPermission: perm }),

  todayFeeling: null,
  setTodayFeeling: (feeling) => set({ todayFeeling: feeling }),
  painScore: 2,
  setPainScore: (score) => set({ painScore: score }),

  activePhysioProgramId: 'shoulder-mobility',
  setActivePhysioProgramId: (id) => set({ activePhysioProgramId: id }),
  physioChecklist: {
    'wall-slide': true,
    'shoulder-rotation': true,
    'scapular-retraction': false,
    'cross-body-stretch': false,
    'knee-extension': true,
    'box-squat': false,
    'hip-hinge': false,
  },
  togglePhysioExercise: (id) =>
    set((state) => ({
      physioChecklist: {
        ...state.physioChecklist,
        [id]: !state.physioChecklist[id],
      },
    })),

  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3800);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  reducedMotion: false,
  setReducedMotion: (val) => set({ reducedMotion: val }),

  resetAllData: () => {
    set({
      todayFeeling: null,
      painScore: 2,
      userGoal: 'both',
      cameraPermission: 'prompt',
      physioChecklist: {
        'wall-slide': false,
        'shoulder-rotation': false,
        'scapular-retraction': false,
        'cross-body-stretch': false,
        'knee-extension': false,
        'box-squat': false,
        'hip-hinge': false,
      },
    });
  },
}));
