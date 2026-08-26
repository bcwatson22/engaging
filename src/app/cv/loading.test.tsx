import { cleanup, render } from '@testing-library/react';

import { Loading } from '@/components/pages/Loading/Loading';

import LoadingPage from './loading';

vi.mock('@/components/pages/Loading/Loading', () => ({
  Loading: vi.fn<typeof import('@/components/pages/Loading/Loading').Loading>(),
}));

const setup = () => render(<LoadingPage />);

describe('Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a Loading component', () => {
    setup();

    expect(Loading).toHaveBeenCalledTimes(1);
  });
});
