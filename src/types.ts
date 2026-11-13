export type ReadingSlot = 'morning_fasting' | 'after_breakfast' | 'after_lunch' | 'after_dinner';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface Reading {
  id: number;
  user_id: number;
  date: string; // YYYY-MM-DD
  slot: ReadingSlot;
  value: number; // 40 to 600 mg/dL
  notes?: string;
  created_at?: string;
}

export interface ReportSummary {
  highest: number | null;
  lowest: number | null;
  average: number | null;
  count: number;
  dateRange: string;
  readings?: Reading[];
}
