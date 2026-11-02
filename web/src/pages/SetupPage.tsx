import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { compileMandate, getMandate } from '../api';

export function SetupPage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getMandate()
      .then((body) => setText(body.mandate?.rawText || ''))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Please try that again.');
      });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await compileMandate(text);
      navigate('/setup/confirm');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold">Your rules</h1>
      <p>Write them the way you would say them. AEGIS turns them into checks on every payment.</p>
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        <label className="flex flex-col gap-2 font-bold" htmlFor="wishes">
          What should always be true?
          <textarea
            id="wishes"
            className="min-h-48 rounded-xl border-2 border-[var(--line)] bg-[var(--card)] px-4 py-3 font-normal"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="rounded-xl bg-[var(--danger)] px-4 py-3 font-bold text-white">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="min-h-14 rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[var(--accent-ink)] disabled:opacity-60"
          disabled={busy || text.trim().length < 8}
        >
          {busy ? 'Saving…' : 'Save my rules'}
        </button>
      </form>
    </section>
  );
}
