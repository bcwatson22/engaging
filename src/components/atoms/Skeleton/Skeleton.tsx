const label = 'Loading...';

type Props = {
  className?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  numOfLines?: number;
  size?: 'base' | 'small';
};

const Skeleton = ({ className }: Props) => (
  <div
    className={`skeleton${className ? ' ' + className : ''}`}
    aria-hidden="true"
  />
);

const SkeletonStatus = () => <output className="sr-only">{label}</output>;

const SkeletonLine = ({ className, size = 'base' }: Props) => (
  <Skeleton
    className={`${
      size === 'small' ? 'skeleton-line-small' : 'skeleton-line-base'
    }${className ? ' ' + className : ''}`}
  />
);

const SkeletonHeading = ({ className, level = 'h2' }: Props) => (
  <Skeleton className={`${level}${className ? ' ' + className : ''}`} />
);

const SkeletonParagraph = ({
  className,
  numOfLines = 4,
  size = 'base',
}: Props) => (
  <div className={`skeleton-paragraph ${className ?? ''}`}>
    {[...Array(numOfLines - 1).keys()].map((key) => (
      <SkeletonLine key={key} size={size} />
    ))}
    <SkeletonLine size={size} />
  </div>
);

export {
  Skeleton,
  SkeletonHeading,
  SkeletonLine,
  SkeletonParagraph,
  SkeletonStatus,
  label,
};
