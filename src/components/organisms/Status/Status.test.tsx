import { cleanup, render, screen, within } from '@testing-library/react';

import type { TRecord, TStatus } from '@/data/types/status';

import { renderShare, shown, Status, type StatusProps, waitOf } from './Status';

const pdfUrl = 'https://artifacts.example.com/billy-watson-cv.pdf';

const recordAt = (at: string, overrides: Partial<TRecord> = {}): TRecord => ({
  at,
  result: pdfUrl,
  durationMs: 14_000,
  attempts: 3,
  elapsedMs: 49_000,
  ...overrides,
});

const status: TStatus = {
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
