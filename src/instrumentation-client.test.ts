import { silenceSkippedTransitions } from '@/utils/silenceSkippedTransitions';

vi.mock('@/utils/silenceSkippedTransitions', () => ({
  silenceSkippedTransitions:
    vi.fn<
      typeof import('@/utils/silenceSkippedTransitions').silenceSkippedTransitions
    >(),
}));

describe('instrumentation-client', () => {
  it('silences skipped view transitions before the app starts', async () => {
    await import('./instrumentation-client');

    expect(silenceSkippedTransitions).toHaveBeenCalledTimes(1);
  });
});
