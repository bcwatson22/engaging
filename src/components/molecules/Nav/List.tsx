'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition } from 'react';

import { Link, type TLink } from '@/components/atoms/Link/Link';
import { useIdle } from '@/hooks/useIdle/useIdle';

type Props = {
  links: TLink[];
  expand: boolean;
};

const isCurrent = (pathname: string | null, target: string): boolean => {
  if (!pathname) return false;
  if (target === '/') return pathname === '/';

  return pathname === target || pathname.startsWith(`${target}/`);
};

const getDirection = (
  index: number,
  currentIndex: number,
): string[] | undefined => {
  if (currentIndex === -1 || index === currentIndex) return undefined;

  return [index > currentIndex ? 'nav-forward' : 'nav-back'];
};

const List = ({ links, expand }: Props) => {
  const pathname = usePathname();
  const currentIndex = links.findIndex((link) =>
    isCurrent(pathname, link!.target),
  );

  const isIdle = useIdle();

  return (
    <ul>
      {links.map((link, index) => {
        const current = index === currentIndex;

        const item = (
          <li key={link?.target}>
            {expand && current && (
              <ViewTransition name="nav-pill">
                <span className="nav-pill" aria-hidden />
              </ViewTransition>
            )}
            <Link
              link={link}
              className={expand ? 'expand' : ''}
              current={current}
              prefetch={expand && isIdle}
              transitionTypes={
                expand ? getDirection(index, currentIndex) : undefined
              }
            />
          </li>
        );

        return expand ? (
          <ViewTransition
            key={link?.target}
            name={`nav-${index}`}
            default="nav-item"
          >
            {item}
          </ViewTransition>
        ) : (
          item
        );
      })}
    </ul>
  );
};

export { getDirection, isCurrent, List };
export type { Props as ListProps };
