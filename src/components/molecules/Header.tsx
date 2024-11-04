import { getImageProps, ImageProps } from "next/image";
import dayjs from "dayjs";

type Props = Pick<
  CV,
  "title" | "logoDarkBackground" | "logoLightBackground" | "intro"
>;

const Header = ({
  title,
  logoDarkBackground,
  logoLightBackground,
  intro,
}: Props) => {
  const commonImageProps: ImageProps = {
    src: logoLightBackground?.url,
    alt: "Billy Watson logo",
    width: 448,
    height: 156,
    priority: true,
  };
  const {
    props: { srcSet: dark },
  } = getImageProps({ ...commonImageProps, src: logoDarkBackground?.url });
  const {
    props: { srcSet: light, ...imageProps },
  } = getImageProps({ ...commonImageProps, src: logoLightBackground?.url });

  const yearsOfExperience = dayjs().diff("2012-06-01", "year").toString();
  const formattedIntro = intro.replace("{{experience}}", yearsOfExperience);

  return (
    <header className="header">
      <h1 className="sr-only">{title}</h1>
      <picture className="mx-auto md:mx-0">
        <source media="(prefers-color-scheme: dark)" srcSet={dark} />
        <source media="(prefers-color-scheme: light)" srcSet={light} />
        <img {...imageProps} alt={commonImageProps.alt} />
      </picture>
      <div>
        <p className="text-sm">{formattedIntro}</p>
      </div>
    </header>
  );
};

export { Header };
