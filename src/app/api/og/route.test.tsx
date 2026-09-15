import sharp from 'sharp';
import type { Mock } from 'vitest';

import { getData } from '@/data/functions/getData';
import { mockHome } from '@/data/mock/home';

import { GET, cacheControl, getImageProps } from './route';

vi.mock('@/data/functions/getData', () => ({
  getData: vi.fn<typeof import('@/data/functions/getData').getData>(),
}));

vi.mock('next/og', async () => {
  const { default: sharpMock } = await import('sharp');

  const png = await sharpMock({
    create: { width: 2, height: 2, channels: 3, background: 'black' },
  })
    .png()
    .toBuffer();

  return {
    ImageResponse: class extends Response {
      constructor() {
        super(new Uint8Array(png));
      }
    },
  };
});

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

  it('responds with a cacheable JPEG', async () => {
    const response = await GET();

    expect(response.headers.get('content-type')).toBe('image/jpeg');
    expect(response.headers.get('cache-control')).toBe(cacheControl);

    const { format } = await sharp(
      Buffer.from(await response.arrayBuffer()),
    ).metadata();

    expect(format).toBe('jpeg');
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
