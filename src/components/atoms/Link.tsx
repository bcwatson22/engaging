import { Icon } from "./Icon";

type Props = {
  link: Link;
  useRawTarget?: boolean;
};

const Link = ({
  link: { text, target, icon },
  useRawTarget = false,
}: Props) => (
  <a
    href={target}
    className={`link icon${useRawTarget ? "" : " url"}`}
    data-url={useRawTarget ? undefined : target.split("https://")[1]}
  >
    <Icon icon={icon} />
    <span>{text}</span>
  </a>
);

export { Link };
