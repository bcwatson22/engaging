import Image from "next/image";
import dayjs from "dayjs";

type Props = Pick<CV, "title" | "logo" | "intro">;

export const Header = ({ title, logo, intro }: Props) => {
  const yearsOfExperience = dayjs().diff("2012-06-01", "year").toString();
  const formattedIntro = intro.replace("{{experience}}", yearsOfExperience);

  return (
    <header>
      <h1 className="sr-only">{title}</h1>
      {logo?.url && (
        <Image
          src={logo.url}
          alt="Billy Watson logo"
          width={100}
          height={100}
          priority
        />
      )}
      <p>{formattedIntro}</p>
    </header>
  );
};
