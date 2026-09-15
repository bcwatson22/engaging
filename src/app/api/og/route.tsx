import { ImageResponse } from 'next/og';

import {
  OgImage,
  type OgImageProps,
} from '@/components/organisms/OgImage/OgImage';
import { getData } from '@/data/functions/getData';
import { snapshotHome } from '@/data/snapshot/snapshot';
import type { THome } from '@/data/types/home';
import { queryHome } from '@/queries/home';
import { formatExperience } from '@/utils/formatExperience';
import { fontFamily, loadFont } from '@/utils/loadFont';

const replaceImageFormat = (
  value: string,
  current = 'webp',
  target = 'png',
): string => value.replace(current, target);

const getImageProps = async (): Promise<OgImageProps> => {
  const home = await getData<THome>(queryHome, 'homes', snapshotHome);

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

const GET = async () =>
  new ImageResponse(<OgImage {...await getImageProps()} />, {
    width: 1200,
    height: 630,
    headers: { 'cache-control': cacheControl },
    fonts: [
      {
        name: fontFamily,
        data: await loadFont(),
        style: 'normal',
      },
    ],
  });

export { GET, getImageProps, cacheControl };

export const revalidate = 86400;
