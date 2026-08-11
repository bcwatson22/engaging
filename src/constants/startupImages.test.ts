import {
  startupDevices,
  getStartupImages,
  getStartupImageName,
  getStartupImageMedia,
} from "./startupImages";

const mockDevice = { width: 430, height: 932, ratio: 3 };
const mockPage = "cv";

describe("getStartupImageName", () => {
  it("multiplies the dimensions by the pixel ratio", () => {
    expect(getStartupImageName(mockDevice)).toBe("1290x2796");
  });
});

describe("getStartupImageMedia", () => {
  it("builds a portrait media query from the device", () => {
    expect(getStartupImageMedia(mockDevice)).toBe(
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    );
  });
});

describe("getStartupImages", () => {
  it("returns an entry per device", () => {
    expect(getStartupImages(mockPage)).toHaveLength(startupDevices.length);
  });

  it("names each image after the page and its pixel dimensions", () => {
    const [first] = getStartupImages(mockPage);

    expect(first).toEqual({
      url: `/startup-${mockPage}-1320x2868.png`,
      media: getStartupImageMedia(startupDevices[0]),
    });
  });

  it("returns a unique media query per entry", () => {
    const media = getStartupImages(mockPage).map((image) => image.media);

    expect(new Set(media).size).toBe(media.length);
  });

  it("returns a unique url per entry", () => {
    const urls = getStartupImages(mockPage).map((image) => image.url);

    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("startupDevices", () => {
  it("only describes portrait devices", () => {
    const landscape = startupDevices.filter(
      ({ width, height }) => width >= height,
    );

    expect(landscape).toEqual([]);
  });
});
