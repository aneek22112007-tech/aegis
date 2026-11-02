import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { compileMandate, getMandate } from '../api';
import { Avatar, field, PageTitle, primaryBtn } from '../senior/ui';
import { Icon } from '../ui/Icon';

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
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_22rem] lg:py-10">
      <section className="flex flex-col gap-5">
        <PageTitle
          title="Your rules"
          lead="Write them the way you would say them. AEGIS turns them into checks on every payment."
        />
        <form className="s-card flex flex-col gap-4 p-5" onSubmit={(event) => void onSubmit(event)}>
          <label className="text-[0.9rem] font-semibold" htmlFor="wishes">
            What should always be true?
          </label>
          <textarea
            id="wishes"
            className={`${field} min-h-48 py-4 leading-relaxed`}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-[var(--danger)] px-5 py-4 font-semibold text-white"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className={`${primaryBtn} sm:w-fit sm:min-w-[14rem]`}
            disabled={busy || text.trim().length < 8}
          >
            {busy ? 'Saving…' : 'Save my rules'}
          </button>
        </form>
      </section>
      <aside className="flex flex-col gap-6" aria-label="Examples">
        <div className="s-card p-5">
          <p className="flex items-center gap-2 text-[0.9rem] font-semibold">
            <Icon name="list" size={22} />
            Things you can say
          </p>
          <ul className="mt-3 flex flex-col gap-3 text-[0.8rem] leading-relaxed text-[var(--muted)]">
            <li>&ldquo;Never send more than $500 to someone new.&rdquo;</li>
            <li>&ldquo;Always allow my pharmacy.&rdquo;</li>
            <li>&ldquo;If it says urgent and secret, stop it and call my daughter.&rdquo;</li>
          </ul>
        </div>
        <div className="s-card flex items-center gap-3 p-5">
          <Avatar name="Priya" size={48} />
          <p className="text-[0.8rem] leading-relaxed">
            Priya sees the same rules and can change them with you.
          </p>
        </div>
      </aside>
    </div>
  );
}
