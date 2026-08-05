import promises from "fs/promises";
import path from "path";

import { saveData } from "./saveData";

import { mockHome } from "@/data/mock/home";

const mockPageName = "Home";
const mockPath = `/src/data/cache/${mockPageName.toLowerCase()}`;

const spyConsoleLog = vi.spyOn(console, "log");

const setup = async () => await saveData(mockHome, mockPageName);

describe("saveData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("calls readFile", async () => {
    const spyReadFile = vi.spyOn(promises, "readFile");

    await setup();

    expect(spyReadFile).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(mockPath)
    );
  });

  it("resolves the file path from the project root", async () => {
    const spyPathJoin = vi.spyOn(path, "join");

    await setup();

    expect(spyPathJoin).toHaveBeenNthCalledWith(
      1,
      process.cwd(),
      `src/data/cache/${mockPageName.toLowerCase()}.ts`
    );
  });

  it("calls writeFile", async () => {
    const spyWriteFile = vi.spyOn(promises, "writeFile");

    await setup();

    expect(spyWriteFile).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(mockPath),
      expect.stringContaining(`import type { T${mockPageName} }`)
    );
  });

  it("logs a success message and returns true on success", async () => {
    const result = await setup();

    expect(spyConsoleLog).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`${mockPageName} page data has been saved!`)
    );

    expect(result).toBe(true);
  });

  it("logs an error message and returns false on error", async () => {
    const spyConsoleError = vi.spyOn(console, "error");
    const mockRejectedValue = "Something went wrong";

    vi.spyOn(promises, "writeFile").mockRejectedValue(mockRejectedValue);

    const result = await setup();

    expect(spyConsoleError).toHaveBeenNthCalledWith(
      1,
      "Error trying to save page data:",
      mockRejectedValue
    );

    expect(result).toBe(false);
  });

  it("logs a warning message if the file doesn't exist", async () => {
    vi.spyOn(promises, "readFile").mockResolvedValue("");

    const result = await setup();

    expect(spyConsoleLog).toHaveBeenNthCalledWith(
      1,
      `Couldn't read ${mockPageName} page data file.`
    );

    expect(result).toBe(true);
  });
});
