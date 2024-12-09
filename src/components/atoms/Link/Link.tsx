import { ComponentPropsWithRef, HTMLAttributeAnchorTarget } from "react";
import NextLink from "next/link";

import { Icon } from "@/components/atoms/Icon/Icon";
import { Skeleton, SkeletonLine } from "@/components/atoms/Skeleton/Skeleton";

type Props = {
  link: Link;
};

type Shared = Omit<ComponentPropsWithRef<"a">, "href"> & {
  href: HTMLAttributeAnchorTarget;
  "data-url": string | null;
};

const LinkSkeleton = () => (
  <div className="link icon relative">
    <Skeleton className="vector rounded-full" />
    <SkeletonLine className="w-[6.75rem]" />
  </div>
);

const Inner = ({ link }: Props) => {
  const { text, icon } = link!;

  return (
    <>
      <Icon icon={icon} className="vector" isHidden />
      <span>{text}</span>
    </>
  );
};

const Link = ({ link }: Props) => {
  const { target } = link!;

  const isLocal = target.startsWith("/");

  let displayUrl =
    target.startsWith("tel:") || target.startsWith("mailto:") ? null : target;

  if (isLocal) displayUrl = `engaging.engineering${target}`;

  if (target.startsWith("https://")) displayUrl = target.split("https://")[1];

  const props: Shared = {
    href: target,
    className: `link icon${displayUrl ? " url" : ""}`,
    "data-url": displayUrl,
  };

  return isLocal ? (
    <NextLink {...props}>
      <Inner link={link} />
    </NextLink>
  ) : (
    <a {...props}>
      <Inner link={link} />
    </a>
  );
};

export { Link, LinkSkeleton };
export type { Props as LinkProps };
