export const REMINDER_TYPE = {
  feed: 'feed',
  water: 'water',
  medicine: 'medicine',
  custom: 'custom',
} as const;

export type TReminderType = keyof typeof REMINDER_TYPE;

export const reminderSearchableFields = ['message', 'type'];
