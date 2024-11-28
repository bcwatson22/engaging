import fs from "fs";
import path from "path";

type Pages = {
  CV: CV;
  Home: Home;
};

export const saveData = (
  data: Pages[keyof Pages],
  page: keyof Pages,
  levels = 4
) => {
  const pathToFile = path.join(
    __dirname,
    `/${Array(levels)
      .fill("")
      .map(() => "../")
      .join("")}src/data/cache/${page.toLowerCase()}.ts`
  );

  fs.readFile(pathToFile, (err) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    fs.writeFile(
      pathToFile,
      `export const cache${page}: ${page} = ${JSON.stringify(data)}`,
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
