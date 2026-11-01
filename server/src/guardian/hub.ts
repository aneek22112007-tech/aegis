export type GuardianAlert = {
  paymentId: string;
  payeeName: string;
  amount: string;
  amountCents: number;
  note: string;
  reasons: string[];
  score: number;
  level: string;
  createdAt: string;
};

export type GuardianEvent =
  | { type: 'alert'; alert: GuardianAlert }
  | { type: 'resolved'; paymentId: string; outcome: 'sent' | 'stopped'; message: string };

type Listener = (event: GuardianEvent) => void;

export function createHub() {
  const listeners = new Set<Listener>();
  return {
    publish(event: GuardianEvent) {
      for (const listener of listeners) listener(event);
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

export type GuardianHub = ReturnType<typeof createHub>;
