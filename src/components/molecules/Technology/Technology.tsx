import Image from "next/image";

type Props = {
  technology: Technology;
};

const Technology = ({ technology: { id, icon, name } }: Props) => (
  <div key={id} className="technology">
    <figure>
      {icon?.url && (
        <Image
          className={name === "Next" ? "white" : ""}
          src={icon.url}
          alt={`${name} logo`}
          width={256}
          height={256}
          priority
        />
      )}
    </figure>
    <span>{name}</span>
  </div>
);

export { Technology };
export type { Props as TechnologyProps };
