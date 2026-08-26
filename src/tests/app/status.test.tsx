import { cleanup, render, screen } from '@testing-library/react';

import StatusPage, {
  description,
  generateMetadata,
  title,
} from '@/app/(site)/status/page';
import { Status } from '@/components/organisms/Status/Status';
import { getStatus } from '@/data/functions/getStatus';
import type { TStatus } from '@/data/types/status';

vi.mock('@/components/organisms/Status/Status', () => ({
  Status: vi.fn<typeof import('@/components/organisms/Status/Status').Status>(),
}));

vi.mock('@/data/functions/getStatus', () => ({
  getStatus: vi.fn<typeof import('@/data/functions/getStatus').getStatus>(),
}));

const status: TStatus = {
  artifacts: { 'cv-pdf': [], 'startup-images': [] },
  integrity: { 'cv-pdf': null, 'startup-images': null },
  links: null,
  queue: { waiting: 0, active: 0, delayed: 0, failed: 0 },
};

const setup = async ({ result = status as TStatus | null } = {}) => {
  vi.mocked(getStatus).mockResolvedValue(result);

  return render(await StatusPage());
};

describe('StatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('gives the page a heading for assistive technology', async () => {
    await setup();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
  });

  it('passes what the service reported to the panel', async () => {
    await setup();

    expect(Status).toHaveBeenCalledTimes(1);
    expect(vi.mocked(Status).mock.calls[0][0]).toEqual({ status });
  });

  /* The page renders either way — a sleeping service is not an error. */
  it('renders with nothing to report', async () => {
    await setup({ result: null });

    expect(vi.mocked(Status).mock.calls[0][0]).toEqual({ status: null });
  });

  it('describes the page for sharing', () => {
    const meta = generateMetadata();

    expect(meta.title).toBe(title);
    expect(meta.description).toBe(description);
  });

  /* A page about plumbing that changes every minute has no business in a
     search result. */
  it('keeps itself out of search results', () => {
    expect(generateMetadata().robots).toMatchObject({ index: false });
  });
});
