export interface CoachFeedback {
  type: 'correction' | 'positive' | 'pacing';
  message: string;
  jointKey?: string;
  timestamp: number;
}
