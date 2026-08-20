import dayjs from 'dayjs';
import type { MetadataRoute } from 'next';

import { domainName } from '@/constants/common';

const lastModified = dayjs().toISOString();
const changeFrequency = 'monthly';

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: domainName,
    lastModified,
    changeFrequency,
    priority: 1,
  },
  {
    url: `${domainName}/cv`,
    lastModified,
    changeFrequency,
    priority: 0.8,
  },
  {
    url: `${domainName}/contact`,
    lastModified,
    changeFrequency,
    priority: 0.5,
  },
  {
    url: `${domainName}/motes`,
    lastModified,
    changeFrequency,
    priority: 0.3,
  },
];

export default sitemap;
export { changeFrequency };
