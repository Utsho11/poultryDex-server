export const EXPENSE_CATEGORY = {
  feed: 'feed',
  medicine: 'medicine',
  labor: 'labor',
  utility: 'utility',
  equipment: 'equipment',
  other: 'other',
} as const;

export type TExpenseCategory = keyof typeof EXPENSE_CATEGORY;

export const expenseSearchableFields = ['note', 'date'];
