import type { THome } from "@/data/types/home";

type Props = THome;

const OgImage = ({
  title,
  mugshot: {
    image: { url },
    heading,
  },
  technologies,
}: Props) => (
  <article
    style={{
      display: "flex",
      alignItems: "center",
      color: "white",
      backgroundColor: "black",
      width: "100%",
      height: "100%",
      padding: 48,
    }}
  >
    <img
      src={url}
      alt={`Portrait of ${heading}`}
      width="360"
      height="360"
      style={{ borderRadius: 180, boxShadow: "0 0 5px 1px white" }}
    />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 36,
        marginLeft: 36,
        marginTop: -36,
      }}
    >
      <h1 style={{ fontSize: 70, lineHeight: "84px", margin: 0 }}>{title}</h1>
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          margin: 0,
          padding: 0,
          gap: 36,
          width: 684,
        }}
      >
        {technologies.map(({ id, name, icon: { url } }) => (
          <li key={id}>
            <figure
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
                width: 84,
                height: 84,
                filter: name === "Next" ? "brightness(0) invert(1)" : "",
              }}
            >
              <img src={url} alt={name} />
            </figure>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export { OgImage };
export type { Props as OgImageProps };
