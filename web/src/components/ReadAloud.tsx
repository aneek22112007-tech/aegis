import { speak } from '../speech';

export function ReadAloud({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="min-h-14 rounded-xl border-4 border-[var(--ink)] px-5 py-3 font-bold"
      onClick={() => speak(text)}
    >
      Read this aloud
    </button>
  );
}
