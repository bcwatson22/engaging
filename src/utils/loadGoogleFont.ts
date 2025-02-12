import { cacheHome } from "@/data/cache/home";

const fontFamily = "Nunito";
const errorMessage = "Failed to load font data";

const loadGoogleFont = async (
  font = fontFamily,
  text = cacheHome.meta.title
) => {
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

  throw new Error(errorMessage);
};

export { loadGoogleFont, errorMessage };
