import { beforeEach, describe, expect, it } from 'vitest';
import { KEY, SCHEMA_VERSION, loadState, saveState, seedState } from './store';

const fresh = () => seedState().payments.length;

describe('demo storage migration', () => {
  beforeEach(() => localStorage.clear());

  it('drops the v1 key and starts from a fresh seed', () => {
    localStorage.setItem('aegis-demo-state-v1', JSON.stringify({ payments: null, payees: 'x' }));
    const s = loadState();
    expect(Array.isArray(s.payments)).toBe(true);
    expect(s.payments.length).toBe(fresh());
    expect(localStorage.getItem('aegis-demo-state-v1')).toBeNull();
  });

  it.each([
    ['garbage', '{not json'],
    ['wrong version', JSON.stringify({ version: 1, state: seedState() })],
    ['bad payment', JSON.stringify({ version: SCHEMA_VERSION, state: { ...seedState(), payments: [{ id: 1 }] } })],
    ['nulls', JSON.stringify({ version: SCHEMA_VERSION, state: null })],
  ])('resets on %s', (_n, raw) => {
    localStorage.setItem(KEY, raw);
    const s = loadState();
    expect(s.payments.length).toBe(fresh());
    expect(JSON.parse(localStorage.getItem(KEY)!).version).toBe(SCHEMA_VERSION);
  });

  it('keeps valid current data', () => {
    const s = seedState();
    s.mandateVersion = 7;
    saveState(s);
    expect(loadState().mandateVersion).toBe(7);
  });
});
