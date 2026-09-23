export const REPORT_EXPORT_FORMAT = {
  json: 'json',
  csv: 'csv',
} as const;

export type TReportExportFormat = keyof typeof REPORT_EXPORT_FORMAT;
