import { useEffect } from 'react';

/** The senior screens scale the root font to 22px; product screens use a 16px root. */
export function useProductType() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = '16px';
    return () => {
      root.style.fontSize = previous;
    };
  }, []);
}
