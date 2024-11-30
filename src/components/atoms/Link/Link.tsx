import { Icon } from "@/components/atoms/Icon/Icon";
import { Skeleton, SkeletonLine } from "@/components/atoms/Skeleton/Skeleton";

type Props = {
  link: Link;
};

const LinkSkeleton = () => (
  <div className="link icon relative">
    <Skeleton className="vector rounded-full" />
    <SkeletonLine className="w-[6.75rem]" />
  </div>
);

const Link = ({ link }: Props) => {
  const { text, target, icon } = link!;

  let displayUrl =
    target.startsWith("tel:") || target.startsWith("mailto:") ? null : target;

  if (target.startsWith("https://")) displayUrl = target.split("https://")[1];

  if (target.startsWith("/")) displayUrl = `engaging.engineering${target}`;

  return (
    <a
      href={target}
      className={`link icon${displayUrl ? " url" : ""}`}
      data-url={displayUrl}
    >
      <Icon icon={icon} className="vector" />
      <span>{text}</span>
    </a>
  );
};

export { Link, LinkSkeleton };
