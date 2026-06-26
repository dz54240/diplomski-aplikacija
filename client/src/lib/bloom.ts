export const BLOOM_LABELS_HR = ['Pamćenje', 'Razumijevanje', 'Primjena', 'Analiza'] as const;

export const BLOOM_HR_TO_API: Record<string, string> = {
  'Pamćenje': 'Remember',
  'Razumijevanje': 'Understand',
  'Primjena': 'Apply',
  'Analiza': 'Analyze',
};

const BLOOM_API_TO_HR: Record<string, string> = {
  Remember: 'Pamćenje',
  Understand: 'Razumijevanje',
  Apply: 'Primjena',
  Analyze: 'Analiza',
};

export function bloomLabel(api: string): string {
  return BLOOM_API_TO_HR[api] ?? api;
}
