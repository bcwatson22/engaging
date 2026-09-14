'use client';

import { MotionConfig } from 'motion/react';
import * as m from 'motion/react-m';
import { usePathname } from 'next/navigation';

import { Link, type TLink } from '@/components/atoms/Link/Link';

type Props = {
  links: TLink[];
  expand: boolean;
};

const pillRadius = 22;

const isCurrent = (pathname: string | null, target: string): boolean => {
  if (!pathname) return false;
  if (target === '/') return pathname === '/';

  return pathname === target || pathname.startsWith(`${target}/`);
};

const List = ({ links, expand }: Props) => {
  const pathname = usePathname();

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
    >
      <ul>
        {links.map((link) => {
          const current = isCurrent(pathname, link!.target);

          return (
            <m.li key={link?.target} layout={expand ? 'position' : false}>
              {expand && current && (
                <m.span
                  layoutId="nav-pill"
                  className="nav-pill"
                  style={{ borderRadius: pillRadius }}
                  aria-hidden
                />
              )}
              <Link
                link={link}
                className={expand ? 'expand' : ''}
                current={current}
                prefetch
              />
            </m.li>
          );
        })}
      </ul>
    </MotionConfig>
  );
};

export { isCurrent, List };
export type { Props as ListProps };
