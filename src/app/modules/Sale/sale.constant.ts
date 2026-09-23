export const SALE_STATUS = {
  paid: 'paid',
  partial: 'partial',
  due: 'due',
} as const;

export const saleSearchableFields = ['customerName', 'customerPhone', 'notes', 'date'];
