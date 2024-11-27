import fs from "fs";
import path from "path";

type Pages = {
  CV: CV;
  Home: Home;
};

type Params = {
  data: Pages[keyof Pages];
  page: keyof Pages;
};

export const saveData = ({ data, page }: Params) =>
  fs.writeFile(
    path.join(
      __dirname,
      `/../../../src/data/testerson-${page.toLowerCase()}.ts`
    ),
    `export const mock${page}: ${page} = ${JSON.stringify(data)}`,
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`${page} page data has been saved!`);
    }
  );
