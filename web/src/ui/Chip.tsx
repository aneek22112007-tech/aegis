import type { ReactNode } from 'react';
import type { ChipTone } from './status';

export function Chip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}
