// Browser copy of the server MandatePolicy shape (validated server-side with zod).
export type MandatePolicy = {
  maxNewPayee: number;
  maxPerTxn: number;
  dailyLimit: number;
  alwaysAllow: string[];
  alwaysBlock: string[];
  scamKeywords: string[];
  quietHours: { start: string; end: string };
  guardian: { name: string; contact: string };
  escalation: string;
};

export type GuardianRef = MandatePolicy['guardian'];
