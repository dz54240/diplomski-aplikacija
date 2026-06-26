export interface ShotExample {
  language: 'hr' | 'en';
  context: string;
  stem: string;
  correct: string;
  distractors: [string, string, string];
}
