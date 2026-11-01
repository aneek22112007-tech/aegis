import { afterEach, describe, expect, it, vi } from 'vitest';
import { speak } from './speech';

describe('speak', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the sentence with the device voice', () => {
    const speakMock = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak: speakMock, cancel });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        lang = '';
        rate = 1;
        constructor(public text: string) {}
      },
    );
    speak('Sent. $48.00 is on its way to CVS Pharmacy.');
    expect(cancel).toHaveBeenCalledOnce();
    expect(speakMock).toHaveBeenCalledOnce();
    expect(speakMock.mock.calls[0]?.[0].text).toBe('Sent. $48.00 is on its way to CVS Pharmacy.');
  });
});
