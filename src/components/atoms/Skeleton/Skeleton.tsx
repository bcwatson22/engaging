const label = "Loading...";

type Props = {
  className?: string;
  numOfLines?: number;
  size?: "base" | "small";
};

const Skeleton = ({ className }: Props) => (
  <div
    className={`skeleton${className ? " " + className : ""}`}
    role="status"
    aria-label={label}
  >
    <span className="sr-only">{label}</span>
  </div>
);

const SkeletonParagraph = ({
  className,
  numOfLines = 4,
  size = "base",
}: Props) => {
  const classNames = size === "small" ? "small" : "base";

  return (
    <div className={`skeleton-paragraph${className ? " " + className : ""}`}>
      {Array(numOfLines - 1)
        .keys()
        .map((key) => (
          <Skeleton key={key} className={classNames} />
        ))}
      <Skeleton className={classNames} />
    </div>
  );
};

export { Skeleton, SkeletonParagraph };
