import { saveData } from "./saveData";

import promises from "fs/promises";

import { mockHome } from "@/data/mock/home";

const mockPageName = "Home";
const mockPath = `/src/data/cache/${mockPageName.toLowerCase()}`;

const setup = async () => await saveData(mockHome, mockPageName, 3);

describe("saveData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls readFile", async () => {
    const readFileSpy = vi.spyOn(promises, "readFile");

    await setup();

    expect(readFileSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(mockPath)
    );
  });

  it("calls writeFile", async () => {
    const writeFileSpy = vi.spyOn(promises, "writeFile");

    await setup();

    expect(writeFileSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(mockPath),
      expect.stringContaining(`import type { T${mockPageName} }`)
    );
  });

  it("logs a success message and returns true on success", async () => {
    const consoleLogSpy = vi.spyOn(console, "log");

    const result = await setup();

    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`${mockPageName} page data has been saved!`)
    );

    expect(result).toBe(true);
  });

  it("logs an error message and returns false on error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error");
    const mockRejectedValue = "Something went wrong";

    vi.spyOn(promises, "writeFile").mockRejectedValue(mockRejectedValue);

    const result = await setup();

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      "Error trying to save page data:",
      mockRejectedValue
    );

    expect(result).toBe(false);
  });
});
