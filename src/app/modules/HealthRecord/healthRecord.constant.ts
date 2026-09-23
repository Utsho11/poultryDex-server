export const HEALTH_RECORD_TYPE = {
  checkup: 'checkup',
  vaccination: 'vaccination',
  injection: 'injection',
  treatment: 'treatment',
} as const;

export type THealthRecordType = keyof typeof HEALTH_RECORD_TYPE;

export const healthRecordSearchableFields = ['description', 'medicineUsed', 'performedBy', 'date'];
