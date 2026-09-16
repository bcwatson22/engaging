import NextLink from 'next/link';
import { ComponentPropsWithRef, HTMLAttributeAnchorTarget } from 'react';

import { Icon, type TIcon } from '@/components/atoms/Icon/Icon';
import { Skeleton, SkeletonLine } from '@/components/atoms/Skeleton/Skeleton';

type TInner = {
  text: string;
  icon: TIcon;
  newTab?: boolean;
};

type TLink =
  | (TID &
      TInner & {
        target: string;
      })
  | null;

type Props = {
  link: TLink;
  className?: string;
  current?: boolean;
  prefetch?: boolean;
  transitionTypes?: string[];
};

type TShared = Omit<ComponentPropsWithRef<'a'>, 'href'> & {
  href: HTMLAttributeAnchorTarget;
  'data-url': string | null;
};

const LinkSkeleton = () => (
  <div className="link icon relative flex h-6 items-center">
    <Skeleton className="vector rounded-full" />
    <SkeletonLine className="ml-2 w-27" />
  </div>
);

const Inner = ({ text, icon, newTab = false }: TInner) => (
  <>
    <Icon icon={icon} className="vector" />
    <span>
      {text}
      {newTab && <span className="sr-only"> (opens in new tab)</span>}
    </span>
  </>
);

const Link = ({
  link,
  className,
  current = false,
  prefetch,
  transitionTypes,
}: Props) => {
  const { target, text, icon, newTab = false } = link!;

  const isLocal = target === '/';
  const isInternal = target.startsWith('/') && !/\.[a-z0-9]+$/i.test(target);

  let displayUrl =
    target.startsWith('tel:') || target.startsWith('mailto:') ? null : target;

  if (isLocal) displayUrl = 'engaging.engineering';

  if (target.startsWith('https://')) displayUrl = target.split('https://')[1];

  const outerProps: TShared = {
    href: target,
    className: `link icon${displayUrl ? ' url' : ''}${
      className ? ' ' + className : ''
    }`,
    'data-url': displayUrl,
    'aria-current': current ? 'page' : undefined,
    ...(newTab && { target: '_blank', rel: 'noopener noreferrer' }),
  };

  const innerProps: TInner = {
    text,
    icon,
    newTab,
  };

  return isInternal ? (
    <NextLink
      {...outerProps}
      prefetch={prefetch}
      transitionTypes={transitionTypes}
    >
      <Inner {...innerProps} />
    </NextLink>
  ) : (
    <a {...outerProps}>
      <Inner {...innerProps} />
    </a>
  );
};

export { Link, LinkSkeleton, Inner };
export type { TLink, Props as LinkProps };
