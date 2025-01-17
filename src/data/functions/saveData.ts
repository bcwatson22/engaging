import promises from "fs/promises";
import path from "path";

import type { TCV } from "../types/cv";
import type { THome } from "../types/home";

type TPages = {
  CV: TCV;
  Home: THome;
};

const saveData = async (
  data: TPages[keyof TPages],
  page: keyof TPages,
  levels = process.env.NODE_ENV === "development" ? 4 : 3
) => {
  const { readFile, writeFile } = promises;

  const pageLower = page.toLowerCase();
  const pathToFile = path.join(
    __dirname,
    `/${Array(levels)
      .fill("")
      .map(() => "../")
      .join("")}src/data/cache/${pageLower}.ts`
  );

  try {
    await readFile(pathToFile);

    await writeFile(
      pathToFile,
      `import type { T${page} } from "../types/${pageLower}";\n\nexport const cache${page}: T${page} = ${JSON.stringify(
        data
      )}`
    );

    console.log(`${page} page data has been saved!`);

    return true;
  } catch (err) {
    console.error("Error trying to save page data:", err);

    return false;
  }
};

export { saveData };
export type { TPages };
