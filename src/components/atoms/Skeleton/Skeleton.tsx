const label = "Loading...";

type Props = {
  className?: string;
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

export { Skeleton };
