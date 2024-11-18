import { Icon } from "@/components/atoms/Icon";

type Props = {
  link: Link;
};

const Link = ({ link: { text, target, icon } }: Props) => {
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
      <Icon icon={icon} />
      <span>{text}</span>
    </a>
  );
};

export { Link };
