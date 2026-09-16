import { ImageResponse } from 'next/og';
import sharp, { type JpegOptions } from 'sharp';

import {
  OgImage,
  type OgImageProps,
} from '@/components/organisms/OgImage/OgImage';
import { getData } from '@/data/functions/getData';
import { snapshotHome } from '@/data/snapshot/snapshot';
import type { Home } from '@/data/types/home';
import { queryHome } from '@/queries/home';
import { formatExperience } from '@/utils/formatExperience';
import { fontFamily, loadFont } from '@/utils/loadFont';

const replaceImageFormat = (
  value: string,
  current = 'webp',
  target = 'png',
): string => value.replace(current, target);

const getImageProps = async (): Promise<OgImageProps> => {
  const home = await getData<Home>(queryHome, 'homes', snapshotHome);

  return {
    ...home,
    meta: {
      ...home.meta,
      description: formatExperience(home.meta.description),
    },
    mugshot: {
      ...home.mugshot,
      image: {
        url: replaceImageFormat(home.mugshot.image.url),
      },
    },
    technologies: home.technologies.map((item) => ({
      ...item,
      icon: {
        ...item.icon,
        url: replaceImageFormat(item.icon.url),
      },
    })),
  };
};

const cacheControl =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

/* ImageResponse only emits PNG, and the portrait compresses badly in it: the
   card came out at 211KB. WhatsApp fetches previews from the sender's phone,
   over whatever connection it has, so those bytes are the visible delay.
   Re-encoded as JPEG it is ~42KB with no difference at thumbnail size. This
   runs at build and on revalidation only; visitors get the cached result. */
const jpegOptions: JpegOptions = { quality: 80, mozjpeg: true };

const GET = async (): Promise<Response> => {
  const png = new ImageResponse(<OgImage {...await getImageProps()} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: fontFamily,
        data: await loadFont(),
        style: 'normal',
      },
    ],
  });

  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg(jpegOptions)
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: { 'content-type': 'image/jpeg', 'cache-control': cacheControl },
  });
};

export { GET, getImageProps, cacheControl, jpegOptions };

export const revalidate = 86400;
