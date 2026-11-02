import { Component, type ErrorInfo, type ReactNode } from 'react';
import { clearDemoStorage } from './demo/store';
import { isChunkError, reloadOnce } from './recover';
import { Logo } from './ui/Logo';

type Props = { children: ReactNode; resetKey?: string };
type State = { error: Error | null };

/** Catches render and lazy-load errors so a route never ends as a blank white page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkError(error) && reloadOnce()) return;
    console.warn('AEGIS recovered from an error', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const chunk = isChunkError(this.state.error);
    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-6 text-[#101828]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16 }}
      >
        <div className="w-full max-w-md rounded-xl border border-[#eaecf0] bg-white p-8 shadow-sm">
          <Logo size={24} />
          <h1 className="mt-6 text-[22px] font-semibold tracking-[-0.01em]">
            Something went wrong
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#475467]">
            {chunk
              ? 'A newer version of AEGIS was published while this page was open. Reload to get it.'
              : 'This screen could not be shown. Your test data may be from an older version. Resetting it starts the demo fresh; nothing real is affected.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="h-10 rounded-lg bg-[#1849a9] px-4 text-[14px] font-semibold text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <button
              type="button"
              className="h-10 rounded-lg border border-[#d0d5dd] bg-white px-4 text-[14px] font-semibold"
              onClick={() => {
                clearDemoStorage();
                window.location.reload();
              }}
            >
              Reset demo data
            </button>
          </div>
        </div>
      </div>
    );
  }
}
