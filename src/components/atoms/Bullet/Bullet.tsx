'use client';

import { type ReactNode, useRef } from 'react';

import { useScrollProgress } from '@/hooks/useScrollProgress/useScrollProgress';

import { SkeletonLine } from '../Skeleton/Skeleton';

type Props = {
  children: ReactNode;
};

type SkeletonProps = {
  index: number;
};

const getWidthClassName = (index: number): string => {
  switch (index) {
    case 0:
    case 5:
      return 'w-[95%]';
    case 1:
      return 'w-[88%]';
    case 2:
    case 7:
      return 'w-[92%]';
    case 3:
      return 'w-[84%]';
    case 4:
      return 'w-[90%]';
    default:
      return 'w-[86%]';
  }
};

const BulletSkeleton = ({ index }: SkeletonProps) => (
  <div className="bullet bullet-skeleton">
    <span aria-hidden="true">Bullet</span>
    <SkeletonLine className={`my-2 ${getWidthClassName(index)}`} />
  </div>
);

const Bullet = ({ children }: Props) => {
  const ref = useRef<HTMLLIElement>(null);
  useScrollProgress({ ref, offset: ['end end', 'start 80vh'] });

  return (
    <li ref={ref} className="bullet">
      <span aria-hidden="true">Bullet</span>
      {children}
    </li>
  );
};

export { Bullet, BulletSkeleton };
export type { Props as BulletProps };
