export interface ExerciseDefinition {
  id: string;
  name: string;
  category: 'yoga' | 'physio' | 'mobility';
  targetReps?: number;
  durationSeconds?: number;
  instructions: string[];
  keyJoints: string[];
}
