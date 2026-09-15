import type { NextPage } from 'next';

import { SkeletonStatus } from '@/components/atoms/Skeleton/Skeleton';
import { Transition } from '@/components/atoms/Transition/Transition';

import { title } from './page';

const LoadingStatus: NextPage = () => (
  <Transition>
    <main id="main" className="status grow">
      <h1 className="sr-only">{title}</h1>
      <SkeletonStatus />
    </main>
  </Transition>
);

export default LoadingStatus;
