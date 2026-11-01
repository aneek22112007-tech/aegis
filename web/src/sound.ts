let context: AudioContext | null = null;

export function unlockSound(): void {
  const Ctx = window.AudioContext;
  if (!Ctx) return;
  if (!context) context = new Ctx();
  if (context.state === 'suspended') void context.resume();
}

export function playAlert(): void {
  if (!context || context.state !== 'running') return;
  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.06, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.42);
}
