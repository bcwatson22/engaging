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

const SkeletonLine = ({ size = "base" }: Props) => (
  <Skeleton
    className={size === "small" ? "skeleton-line-small" : "skeleton-line-base"}
  />
);

const SkeletonParagraph = ({
  className,
  numOfLines = 4,
  size = "base",
}: Props) => (
  <div className={`skeleton-paragraph${className ? " " + className : ""}`}>
    {Array(numOfLines - 1)
      .keys()
      .map((key) => (
        <SkeletonLine key={key} size={size} />
      ))}
    <SkeletonLine size={size} />
  </div>
);

export { Skeleton, SkeletonParagraph, SkeletonLine };
