import { getImageProps, ImageProps } from "next/image";
import { Intro } from "../atoms/Intro";
import { CSSProperties, Suspense } from "react";

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
  const alt = "Billy Watson logo";
  const commonImageProps: ImageProps = {
    src: logoLightBackground?.url,
    alt,
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

  return (
    <header className="header">
      <h1 className="sr-only">{title}</h1>
      <picture className="screen-logo">
        <source media="print" srcSet={light} />
        <source media="(prefers-color-scheme: light)" srcSet={light} />
        <source media="(prefers-color-scheme: dark)" srcSet={dark} />
        <img {...imageProps} alt={commonImageProps.alt} />
      </picture>
      <span
        className="print-logo"
        style={{ backgroundImage: `url(${logoLightBackground?.url})` }}
      >
        {alt}
      </span>
      <div>
        <Suspense>
          <Intro intro={intro} />
        </Suspense>
      </div>
    </header>
  );
};

export { Header };
