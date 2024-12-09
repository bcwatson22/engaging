import { getImageProps, ImageProps } from "next/image";

type Props = Pick<CV, "logoDarkBackground" | "logoLightBackground">;

const alt = "Billy Watson logo";

const Logo = ({ logoDarkBackground, logoLightBackground }: Props) => {
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
    <>
      <picture className="screen-logo">
        <source media="print" srcSet={light} />
        <source media="(prefers-color-scheme: light)" srcSet={light} />
        <source media="(prefers-color-scheme: dark)" srcSet={dark} />
        <img {...imageProps} alt={commonImageProps.alt} />
      </picture>
      <div
        className="print-logo"
        style={{ backgroundImage: `url(${logoLightBackground?.url})` }}
        role="figure"
        aria-labelledby="caption"
      >
        <span id="caption">{alt}</span>
      </div>
    </>
  );
};

export { Logo, alt };
export type { Props as LogoProps };
