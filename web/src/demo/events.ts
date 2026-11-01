export type GuardianEvent =
  | {
      type: 'alert';
      alert: {
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
    }
  | { type: 'resolved'; paymentId: string; outcome: string; message: string };

type Listener = (event: GuardianEvent) => void;

const listeners = new Set<Listener>();
const channel =
  typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('aegis-guardian');

channel?.addEventListener('message', (message: MessageEvent<GuardianEvent>) => {
  for (const listener of listeners) listener(message.data);
});

/** In-browser stand-in for the server's SSE guardian hub (works across tabs). */
export function publish(event: GuardianEvent): void {
  for (const listener of listeners) listener(event);
  channel?.postMessage(event);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
