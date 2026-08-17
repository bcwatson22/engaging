import { formatRelative } from './formatRelative';

const now = new Date('2026-08-17T12:00:00.000Z');

const setup = (at: string) => formatRelative(at);

describe('formatRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => vi.useRealTimers());

  it('reads a recent moment as minutes ago', () => {
    expect(setup('2026-08-17T11:45:00.000Z')).toBe('15 minutes ago');
  });

  it('reads an older moment in hours', () => {
    expect(setup('2026-08-17T09:00:00.000Z')).toBe('3 hours ago');
  });

  it('reads a much older moment in days', () => {
    expect(setup('2026-08-14T12:00:00.000Z')).toBe('3 days ago');
  });

  /* The service stamps these itself, so a value this side cannot parse means
     the two have drifted — worth saying plainly rather than rendering
     "Invalid Date" into the page. */
  it('says so when the timestamp cannot be read', () => {
    expect(setup('not a date')).toBe('at an unknown time');
  });
});
