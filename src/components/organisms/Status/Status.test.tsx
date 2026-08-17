import { cleanup, render, screen, within } from '@testing-library/react';

import type { TStatus } from '@/data/types/status';

import { Status, type StatusProps } from './Status';

const pdfUrl = 'https://artifacts.example.com/billy-watson-cv.pdf';

const status: TStatus = {
  artifacts: {
    'cv-pdf': { at: '2026-08-17T09:00:00.000Z', result: pdfUrl },
    'startup-images': {
      at: '2026-08-17T09:00:00.000Z',
      result: '22 startup images',
    },
  },
  queue: { waiting: 0, active: 0, delayed: 0, failed: 0 },
};

const setup = (props?: Partial<StatusProps>) =>
  render(<Status status={status} {...props} />);

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

  it('reads the last render as a relative time', () => {
    setup();

    expect(screen.getAllByText('3 hours ago')).toHaveLength(2);
  });

  /* The loose reading is for people; the exact moment stays machine-readable
     beside it. */
  it('keeps the exact moment in the markup', () => {
    setup();

    expect(screen.getAllByText('3 hours ago')[0]).toHaveAttribute(
      'datetime',
      '2026-08-17T09:00:00.000Z',
    );
  });

  it('shows what the render produced', () => {
    setup();

    expect(screen.getByText(pdfUrl)).toBeInTheDocument();
    expect(screen.getByText('22 startup images')).toBeInTheDocument();
  });

  it('says so for an artifact that has never been rendered', () => {
    setup({
      status: { ...status, artifacts: { ...status.artifacts, 'cv-pdf': null } },
    });

    expect(screen.getByText(/not rendered since/i)).toBeInTheDocument();
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
      expect(countFor(/rendering/i)).toBe('2');
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

    it('reassures that the artifacts are unaffected', () => {
      setup({ status: null });

      expect(screen.getByText(/served from storage/i)).toBeInTheDocument();
    });

    it('shows no queue to read', () => {
      setup({ status: null });

      expect(screen.queryByText(/render queue/i)).not.toBeInTheDocument();
    });
  });
});
