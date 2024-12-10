import fs from "fs";
import path from "path";
import { type TCV } from "../types/cv";
import { type THome } from "../types/home";

type Pages = {
  CV: TCV;
  Home: THome;
};

export const saveData = (
  data: Pages[keyof Pages],
  page: keyof Pages,
  levels = 4
) => {
  const pageLower = page.toLowerCase();
  const pathToFile = path.join(
    __dirname,
    `/${Array(levels)
      .fill("")
      .map(() => "../")
      .join("")}src/data/cache/${pageLower}.ts`
  );

  fs.readFile(pathToFile, (err) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    fs.writeFile(
      pathToFile,
      `import { type T${page} } from "../types/${pageLower}";\n\nexport const cache${page}: T${page} = ${JSON.stringify(
        data
      )}`,
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`${page} page data has been saved!`);
      }
    );
  });
};
