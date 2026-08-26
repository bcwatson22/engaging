import { domainName } from '@/constants/common';

import robots from './robots';

describe('robots', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a robots', () => {
    const result = robots();

    expect(result).toEqual(
      expect.objectContaining({ sitemap: expect.stringContaining(domainName) }),
    );
  });
});
