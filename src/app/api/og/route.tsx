import { ImageResponse } from "next/og";

import { cacheHome } from "@/data/cache/home";

const {
  title,
  mugshot: {
    image: { url },
    heading,
  },
  technologies,
} = cacheHome;
const fontFamily = "Nunito";

const ImageMarkup = () => (
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

const loadGoogleFont = async (font = fontFamily, text = title) => {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);

    if (response.status == 200) return await response.arrayBuffer();
  }

  throw new Error("Failed to load font data");
};

export const GET = async () =>
  new ImageResponse(<ImageMarkup />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: fontFamily,
        data: await loadGoogleFont(),
        style: "normal",
      },
    ],
  });
