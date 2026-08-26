import { cleanup, render, screen, within } from '@testing-library/react';

import type { TCheck, TRecord, TStatus, TSweep } from '@/data/types/status';

import {
  renderShare,
  shown,
  stateOf,
  Status,
  type StatusProps,
  states,
  waitOf,
} from './Status';

const pdfUrl = 'https://artifacts.example.com/billy-watson-cv.pdf';

const recordAt = (at: string, overrides: Partial<TRecord> = {}): TRecord => ({
  at,
  result: pdfUrl,
  durationMs: 14_000,
  attempts: 3,
  elapsedMs: 49_000,
  ...overrides,
});

const check = (overrides: Partial<TCheck> = {}): TCheck => ({
  at: '2026-08-17T11:00:00.000Z',
  drifted: false,
  queued: false,
  stale: false,
  ...overrides,
});

const sweep = (overrides: Partial<TSweep> = {}): TSweep => ({
  at: '2026-08-17T11:00:00.000Z',
  checked: 12,
  problems: [],
  ...overrides,
});

const status: TStatus = {
  links: sweep(),
  integrity: { 'cv-pdf': check(), 'startup-images': check() },
  artifacts: {
    'cv-pdf': [recordAt('2026-08-17T09:00:00.000Z')],
    'startup-images': [
      recordAt('2026-08-17T09:00:00.000Z', { result: '22 startup images' }),
    ],
  },
  queue: { waiting: 0, active: 0, delayed: 0, failed: 0 },
};

const setup = (props?: Partial<StatusProps>) =>
  render(<Status status={status} {...props} />);

const withHistory = (history: TRecord[]): TStatus => ({
  ...status,
  artifacts: { ...status.artifacts, 'cv-pdf': history },
});

const withCheck = (found: TCheck | null): TStatus => ({
  ...status,
  integrity: { ...status.integrity, 'cv-pdf': found },
});

const countFor = (name: RegExp): string =>
  within(screen.getByText(name).closest('li') as HTMLElement).getByText(/^\d+$/)
    .textContent ?? '';

describe('Status', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-17T12:00:00.000Z'));
    cleanup();
  });

  afterEach(() => vi.useRealTimers());

  it('names the panel for assistive technology', () => {
    setup();

    expect(
      screen.getByRole('region', { name: /service status/i }),
    ).toBeInTheDocument();
  });

  it('says what each artifact is, rather than what the service calls it', () => {
    setup();

    expect(
      screen.getByRole('heading', { name: /cv document/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /splash screens/i }),
    ).toBeInTheDocument();
  });

  describe('freshness', () => {
    it('leads with how long ago, which is what someone came for', () => {
      setup();

      expect(screen.getAllByText('3 hours ago')).toHaveLength(2);
    });

    /* The loose reading is for people; the exact moment stays
       machine-readable beside it. */
    it('keeps the exact moment in the markup', () => {
      setup();

      expect(screen.getAllByText(/GMT/)[0]).toHaveAttribute(
        'datetime',
        '2026-08-17T09:00:00.000Z',
      );
    });

    it('says so for an artifact that has never been rendered', () => {
      setup({ status: withHistory([]) });

      expect(screen.getByText(/not rendered since/i)).toBeInTheDocument();
    });
  });

  describe('the wait-and-render bar', () => {
    /* Identity never rests on colour — the palette's contrast check obliges
       labels rather than merely suggesting them, and the bar itself is hidden
       because these carry everything it draws. */
    it('states both segments in text', () => {
      setup();

      expect(screen.getAllByText(/waited/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/rendered/i).length).toBeGreaterThan(0);
    });

    it('reads the wait and the render as durations', () => {
      setup();

      expect(
        screen.getAllByText(/35s over 3 attempts/i).length,
      ).toBeGreaterThan(0);
      expect(screen.getAllByText('14s').length).toBeGreaterThan(0);
    });

    it('reads a single attempt in the singular', () => {
      setup({
        status: withHistory([
          recordAt('2026-08-17T09:00:00.000Z', { attempts: 1 }),
        ]),
      });

      expect(screen.getAllByText(/1 attempt$/i).length).toBeGreaterThan(0);
    });
  });

  describe('render times', () => {
    const history = [
      recordAt('2026-08-17T09:00:00.000Z', { durationMs: 20_000 }),
      recordAt('2026-08-16T09:00:00.000Z', { durationMs: 10_000 }),
    ];

    it('offers the same numbers as a table, not only as bars', () => {
      setup({ status: withHistory(history) });

      expect(
        screen.getByRole('table', { name: /render time/i }),
      ).toBeInTheDocument();
    });

    it('lists every render it drew', () => {
      setup({ status: withHistory(history) });

      const table = screen.getByRole('table', { name: /render time/i });

      expect(within(table).getByText('20s')).toBeInTheDocument();
      expect(within(table).getByText('10s')).toBeInTheDocument();
    });

    /* One render is a number, not a history — a chart of it says nothing. */
    it('draws nothing until there is more than one render', () => {
      setup();

      expect(
        screen.queryByRole('table', { name: /render time/i }),
      ).not.toBeInTheDocument();
    });

    it('draws no more than it can show legibly', () => {
      const many = Array.from({ length: shown + 5 }, (_, index) =>
        recordAt(new Date(Date.UTC(2026, 7, index + 1)).toISOString()),
      );

      setup({ status: withHistory(many) });

      const table = screen.getByRole('table', { name: /render time/i });

      expect(within(table).getAllByRole('row')).toHaveLength(shown + 1);
    });
  });

  /* Status rather than a series: an icon and a sentence carry it, so the
     colour is reinforcement rather than the message. */
  describe('the integrity check', () => {
    it('says when an artifact still matches its page', () => {
      setup();

      expect(screen.getAllByText(states.current.says).length).toBeGreaterThan(
        0,
      );
    });

    it('says when a page changed and a re-render is on its way', () => {
      setup({ status: withCheck(check({ drifted: true, queued: true })) });

      expect(screen.getByText(states.queued.says)).toBeInTheDocument();
    });

    /* The one worth catching an eye — re-rendering has already been tried
       and did not fix it. */
    it('says when a re-render did not put it right', () => {
      setup({
        status: withCheck(check({ drifted: true, stale: true })),
      });

      expect(screen.getByText(states.stale.says)).toBeInTheDocument();
    });

    it('says when no check has run yet', () => {
      setup({ status: withCheck(null) });

      expect(screen.getByText(states.unchecked.says)).toBeInTheDocument();
    });

    it('says when it last looked', () => {
      setup();

      expect(
        screen.getAllByText(/checked an hour ago/i).length,
      ).toBeGreaterThan(0);
    });

    it('gives no time for a check that has never run', () => {
      /* Both, because the other card's check would otherwise answer for it. */
      setup({
        status: {
          ...status,
          integrity: { 'cv-pdf': null, 'startup-images': null },
        },
      });

      expect(screen.queryByText(/checked .* ago/i)).not.toBeInTheDocument();
    });
  });

  /* Reported, never alarmed about — a host refusing a robot is not a link
     that has gone. */
  describe('the outbound links', () => {
    it('reassures with a count when they all answered', () => {
      setup();

      expect(
        screen.getByText(/12 outbound links checked/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/all answering/i)).toBeInTheDocument();
    });

    it('says how many did not answer', () => {
      setup({
        status: {
          ...status,
          links: sweep({
            problems: [{ url: 'https://a.com', status: 404, state: 'broken' }],
          }),
        },
      });

      expect(screen.getByText(/1 not answering/i)).toBeInTheDocument();
    });

    it('names the link that failed, so it can be fixed', () => {
      setup({
        status: {
          ...status,
          links: sweep({
            problems: [{ url: 'https://a.com', status: 404, state: 'broken' }],
          }),
        },
      });

      expect(screen.getByText('https://a.com')).toBeInTheDocument();
      expect(screen.getByText(/did not answer \(404\)/i)).toBeInTheDocument();
    });

    /* Listed, but not counted as broken and not coloured as an alarm. */
    it('shows a blocked host without calling it broken', () => {
      setup({
        status: {
          ...status,
          links: sweep({
            problems: [
              { url: 'https://linkedin.com', status: 999, state: 'blocked' },
            ],
          }),
        },
      });

      expect(
        screen.getByText(/refused an automated check/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/all answering/i)).toBeInTheDocument();
    });

    it('omits a status nobody can act on', () => {
      setup({
        status: {
          ...status,
          links: sweep({
            problems: [{ url: 'https://a.com', status: 0, state: 'broken' }],
          }),
        },
      });

      expect(screen.getByText(/^did not answer$/i)).toBeInTheDocument();
    });

    it('reads a single link in the singular', () => {
      setup({ status: { ...status, links: sweep({ checked: 1 }) } });

      expect(screen.getByText(/1 outbound link checked/i)).toBeInTheDocument();
    });

    it('says when no sweep has run', () => {
      setup({ status: { ...status, links: null } });

      expect(
        screen.getByText(/have not been checked yet/i),
      ).toBeInTheDocument();
    });
  });

  describe('the queue', () => {
    it('reports every count', () => {
      setup({
        status: {
          ...status,
          queue: { waiting: 1, active: 2, delayed: 3, failed: 4 },
        },
      });

      expect(countFor(/waiting/i)).toBe('1');
      expect(countFor(/^rendering$/i)).toBe('2');
      expect(countFor(/retrying/i)).toBe('3');
      expect(countFor(/failed/i)).toBe('4');
    });

    it('marks a count with something in it as busy', () => {
      setup({ status: { ...status, queue: { ...status.queue, failed: 2 } } });

      expect(screen.getByText(/failed/i).closest('li')).toHaveAttribute(
        'data-busy',
        'true',
      );
    });

    it('leaves an empty count unmarked, since empty is the normal state', () => {
      setup();

      expect(screen.getByText(/failed/i).closest('li')).toHaveAttribute(
        'data-busy',
        'false',
      );
    });
  });

  /* Being unreachable is the service's ordinary resting state — it sleeps
     between renders — so this is not an error page. */
  describe('when the service cannot be reached', () => {
    it('explains rather than erroring', () => {
      setup({ status: null });

      expect(screen.getByText(/sleeps between renders/i)).toBeInTheDocument();
    });

    it('shows no queue to read', () => {
      setup({ status: null });

      expect(screen.queryByText(/render queue/i)).not.toBeInTheDocument();
    });
  });
});

describe('stateOf', () => {
  it('is unchecked before a check has run', () => {
    expect(stateOf(null)).toBe('unchecked');
  });

  it('is current when nothing has drifted', () => {
    expect(stateOf(check())).toBe('current');
  });

  it('is queued when it drifted and a render was asked for', () => {
    expect(stateOf(check({ drifted: true, queued: true }))).toBe('queued');
  });

  /* Stale outranks drifted: both are true at once, and stale is the one that
     means re-rendering will not help. */
  it('is stale when a render was already tried and did not help', () => {
    expect(stateOf(check({ drifted: true, queued: false, stale: true }))).toBe(
      'stale',
    );
  });
});

describe('waitOf', () => {
  it('is the elapsed time less the render itself', () => {
    expect(waitOf(recordAt('2026-08-17T09:00:00.000Z'))).toBe(35_000);
  });

  /* Two clocks produce these numbers, so the difference can come out
     backwards. A negative wait is not a thing. */
  it('never goes below nothing', () => {
    expect(waitOf(recordAt('x', { elapsedMs: 1_000, durationMs: 5_000 }))).toBe(
      0,
    );
  });
});

describe('renderShare', () => {
  it('is the render as a share of the whole', () => {
    expect(
      renderShare(recordAt('x', { elapsedMs: 20_000, durationMs: 5_000 })),
    ).toBe(25);
  });

  it('fills the bar when a render took no measurable time', () => {
    expect(renderShare(recordAt('x', { elapsedMs: 0, durationMs: 0 }))).toBe(
      100,
    );
  });
});
