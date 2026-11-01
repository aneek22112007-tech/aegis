export function startHoldTimeoutJob(run: () => Promise<unknown>, intervalMs: number): () => void {
  const timer = setInterval(() => {
    void run().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Hold timeout failed';
      console.error(message);
    });
  }, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}
