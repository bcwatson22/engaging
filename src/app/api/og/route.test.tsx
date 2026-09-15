import { ImageResponse } from 'next/og';
import type { Mock } from 'vitest';

import { getData } from '@/data/functions/getData';
import { mockHome } from '@/data/mock/home';

import { GET, getImageProps } from './route';

vi.mock('@/data/functions/getData', () => ({
  getData: vi.fn<typeof import('@/data/functions/getData').getData>(),
}));

const webpUrl = 'https://example.com/asset/output=format:webp/id';

const setup = () => {
  (getData as Mock).mockResolvedValue({
    ...mockHome,
    mugshot: { ...mockHome.mugshot, image: { url: webpUrl } },
    technologies: mockHome.technologies.map((item) => ({
      ...item,
      icon: { ...item.icon, url: webpUrl },
    })),
  });
};

describe('dynamic Open Graph image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setup();
  });

  it('returns ImageResponse', async () => {
    expect((await GET()) instanceof ImageResponse).toBe(true);
  });

  it('rewrites asset URLs from webp to png', async () => {
    const { mugshot, technologies } = await getImageProps();

    const expected = webpUrl.replace('webp', 'png');

    expect(mugshot.image.url).toBe(expected);
    for (const { icon } of technologies) {
      expect(icon.url).toBe(expected);
    }
  });
});
