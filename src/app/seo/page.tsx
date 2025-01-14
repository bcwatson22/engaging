import Image from "next/image";

import { cacheHome } from "@/data/cache/home";

const SeoPage = () => (
  <div
    style={{
      display: "flex",

      color: "white",
      background: "black",
      width: "100%",
      height: "100%",
      padding: 48,
      alignItems: "center",
      gap: 36,
      // flexDirection: "column",
      // justifyContent: "center",
      maxWidth: 1200,
      maxHeight: 630,
    }}
  >
    <img
      src={cacheHome.mugshot.image.url}
      alt={`Portrait of ${cacheHome.mugshot.heading}`}
      width="360"
      height="360"
      style={{ borderRadius: 180, boxShadow: "0 0 5px 1px white" }}
    />
    <div>
      <h1 style={{ fontSize: 70, lineHeight: "84px", marginBottom: 36 }}>
        {cacheHome.title}
      </h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 36,
          width: "100%",
          height: "100%",
        }}
      >
        {cacheHome.technologies.map((technology) => (
          <figure
            key={technology.id}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
              filter:
                technology.name === "Next" ? "brightness(0) invert(1)" : "",
            }}
          >
            <img
              src={technology.icon.url}
              alt={technology.name}
              width="84"
              height="84"
            />
          </figure>
        ))}
      </div>
    </div>
  </div>
);

export default SeoPage;
