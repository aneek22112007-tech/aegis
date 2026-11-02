import { speak } from '../speech';
import { Icon } from '../ui/Icon';

export function ReadAloud({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-6 py-3 text-[0.9rem] font-semibold hover:bg-[var(--bg)]"
      onClick={() => speak(text)}
    >
      <Icon name="volume" size={22} />
      Read this aloud
    </button>
  );
}
