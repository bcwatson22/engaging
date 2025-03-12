import { ComponentPropsWithRef, HTMLAttributeAnchorTarget } from "react";
import NextLink from "next/link";

import { Icon, type TIcon } from "@/components/atoms/Icon/Icon";
import { Skeleton, SkeletonLine } from "@/components/atoms/Skeleton/Skeleton";

type TInner = {
  text: string;
  icon: TIcon;
};

type TLink =
  | (TID &
      TInner & {
        target: string;
      })
  | null;

type Props = {
  link: TLink;
};

type TShared = Omit<ComponentPropsWithRef<"a">, "href"> & {
  href: HTMLAttributeAnchorTarget;
  "data-url": string | null;
};

const LinkSkeleton = () => (
  <div className="link icon relative">
    <Skeleton className="vector rounded-full" />
    <SkeletonLine className="w-[6.75rem]" />
  </div>
);

const Inner = ({ text, icon }: TInner) => (
  <>
    <Icon icon={icon} className="vector" />
    <span>{text}</span>
  </>
);

const Link = ({ link }: Props) => {
  const { target, text, icon } = link!;

  const isLocal = target.startsWith("/");

  let displayUrl =
    target.startsWith("tel:") || target.startsWith("mailto:") ? null : target;

  if (isLocal) displayUrl = "engaging.engineering";

  if (target.startsWith("https://")) displayUrl = target.split("https://")[1];

  const outerProps: TShared = {
    href: target,
    className: `link icon${displayUrl ? " url" : ""}`,
    "data-url": displayUrl,
  };

  const innerProps: TInner = {
    text,
    icon,
  };

  return isLocal ? (
    <NextLink {...outerProps}>
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
