const label = "Loading...";

type TProps = {
  className?: string;
  level?: "h1" | "h2" | "h3" | "h4";
  numOfLines?: number;
  size?: "base" | "small";
};

const Skeleton = ({ className }: TProps) => (
  <div
    className={`skeleton${className ? " " + className : ""}`}
    role="status"
    aria-label={label}
  >
    <span className="sr-only">{label}</span>
  </div>
);

const SkeletonLine = ({ className, size = "base" }: TProps) => (
  <Skeleton
    className={`${
      size === "small" ? "skeleton-line-small" : "skeleton-line-base"
    }${className ? " " + className : ""}`}
  />
);

const SkeletonHeading = ({ className, level = "h2" }: TProps) => (
  <Skeleton className={`${level}${className ? " " + className : ""}`} />
);

const SkeletonParagraph = ({
  className,
  numOfLines = 4,
  size = "base",
}: TProps) => (
  <div className={`skeleton-paragraph${className ? " " + className : ""}`}>
    {[...Array(numOfLines - 1).keys()].map((key) => (
      <SkeletonLine key={key} size={size} />
    ))}
    <SkeletonLine size={size} />
  </div>
);

export { Skeleton, SkeletonHeading, SkeletonLine, SkeletonParagraph, label };
