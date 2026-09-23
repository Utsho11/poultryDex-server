export interface FeedLot {
  date: string;
  totalKg: number;
  remainingKg: number;
  costPerKg: number;
}

export interface IActivityItem {
  type: string;
  description: string;
  user: string;
  timestamp: string | Date;
  metadata: Record<string, unknown>;
}
