import type { ReactNode } from 'react';

export function Phone({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <figure id={id} className="scroll-mt-6 flex flex-col items-center gap-3">
      <div className="relative h-[380px] w-full max-w-[250px] sm:h-[440px] rounded-[2.2rem] border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.02] p-2 shadow-[0_30px_80px_-30px_rgba(52,245,176,0.35)]">
        <div className="absolute left-1/2 top-3 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
        <div className="flex h-full flex-col overflow-hidden rounded-[1.8rem] bg-[#070b14] px-3 pb-3 pt-9 sm:px-4 sm:pb-4 text-white">
          {children}
        </div>
      </div>
      <figcaption className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</figcaption>
    </figure>
  );
}
