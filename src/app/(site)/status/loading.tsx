import type { NextPage } from 'next';

import { SkeletonStatus } from '@/components/atoms/Skeleton/Skeleton';

import { title } from './page';

const LoadingStatus: NextPage = () => (
  <main id="main" className="status grow">
    <h1 className="sr-only">{title}</h1>
    <SkeletonStatus />
  </main>
);

export default LoadingStatus;
