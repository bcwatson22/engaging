import { unstable_cache } from 'next/cache';
import type { Mock } from 'vitest';

import { revalidate } from '@/constants/common';
import { mockHome } from '@/data/mock/home';
import { fetchCms } from '@/queries/client';
import { queryHome } from '@/queries/home';

import { getData, cmsTag, errorMessage, emptyMessage } from './getData';

vi.mock('@/queries/client', () => ({
  fetchCms: vi.fn<typeof import('@/queries/client').fetchCms>(),
}));

/* Unwrapped so the cached callback runs inline; the caching contract itself
   is asserted through the arguments unstable_cache is given. */
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn<typeof import('next/cache').unstable_cache>(
    (callback) => callback,
  ),
}));

const key = 'homes';
const mockFallback = { key: 'value' };

type Options = {
  response?: unknown;
  rejection?: Error;
};

const setup = async ({ response, rejection }: Options = {}) => {
  if (rejection) (fetchCms as Mock).mockRejectedValue(rejection);
  else
    (fetchCms as Mock).mockResolvedValue(
      response ?? { data: { homes: [mockHome] } },
    );

  return await getData(queryHome, key, mockFallback);
};

describe('getData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns the first item for the requested key', async () => {
    const result = await setup();

    expect(result).toBe(mockHome);
  });

  it('caches per key, tagged, at the same revalidate as the page', async () => {
    await setup();

    expect(unstable_cache).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      [key],
      { tags: [cmsTag], revalidate },
    );
  });

  it('falls back and logs when the request fails', async () => {
    const rejection = new Error('network down');

    const result = await setup({ rejection });

    expect(result).toBe(mockFallback);
    expect(console.error).toHaveBeenNthCalledWith(1, errorMessage, rejection);
  });

  it('falls back and logs when the response carries GraphQL errors', async () => {
    const result = await setup({
      response: { errors: [{ message: 'first' }, { message: 'second' }] },
    });

    expect(result).toBe(mockFallback);
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      errorMessage,
      new Error('first, second'),
    );
  });

  it('falls back and logs when the response holds no data', async () => {
    const result = await setup({ response: {} });

    expect(result).toBe(mockFallback);
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      errorMessage,
      new Error(`${emptyMessage} ${key}`),
    );
  });

  it('falls back and logs when the collection is empty', async () => {
    const result = await setup({ response: { data: { homes: [] } } });

    expect(result).toBe(mockFallback);
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      errorMessage,
      new Error(`${emptyMessage} ${key}`),
    );
  });
});
