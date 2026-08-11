import promises from "fs/promises";
import path from "path";

import type { TCV } from "../types/cv";
import type { THome } from "../types/home";

type TPages = {
  CV: TCV;
  Home: THome;
};

const saveData = async (data: TPages[keyof TPages], page: keyof TPages) => {
  const { readFile, writeFile } = promises;

  const pageLower = page.toLowerCase();
  const pathToFile = path.join(process.cwd(), `src/data/cache/${pageLower}.ts`);

  try {
    const file = await readFile(pathToFile);

    if (file) {
      await writeFile(
        pathToFile,
        `import type { T${page} } from "../types/${pageLower}";\n\nexport const cache${page}: T${page} = ${JSON.stringify(
          data,
        )}`,
      );

      console.log(`\n${page} page data has been saved!`);
    } else {
      console.log(`Couldn't read ${page} page data file.`);
    }

    return true;
  } catch (err) {
    console.error("Error trying to save page data:", err);

    return false;
  }
};

export { saveData };
export type { TPages };
