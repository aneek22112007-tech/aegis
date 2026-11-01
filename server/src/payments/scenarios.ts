export const DEMO_SCENARIOS = {
  pharmacy: {
    payeeName: 'CVS Pharmacy',
    amount: 48,
    note: 'Prescription refill',
  },
  'new-payee': {
    payeeName: 'Helen Brooks',
    amount: 650,
    note: 'Birthday gift',
  },
  scam: {
    payeeName: 'Officer James',
    amount: 1900,
    note: 'URGENT keep this secret, your grandson needs bail',
  },
} as const;

export type DemoScenario = keyof typeof DEMO_SCENARIOS;
