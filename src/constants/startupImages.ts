type StartupDevice = {
  width: number;
  height: number;
  ratio: number;
};

type StartupImage = {
  url: string;
  media: string;
};

// Unique portrait device-width // device-height // pixel-ratio combinations.
// Several device families share dimensions, so one entry covers them all.
const startupDevices: StartupDevice[] = [
  { width: 440, height: 956, ratio: 3 }, // 16 Pro Max
  { width: 430, height: 932, ratio: 3 }, // 16 Plus, 15 Pro Max, 14 Pro Max
  { width: 428, height: 926, ratio: 3 }, // 14 Plus, 13 Pro Max, 12 Pro Max
  { width: 414, height: 896, ratio: 3 }, // 11 Pro Max, XS Max
  { width: 414, height: 896, ratio: 2 }, // 11, XR
  { width: 402, height: 874, ratio: 3 }, // 16 Pro
  { width: 393, height: 852, ratio: 3 }, // 16, 15 Pro, 15, 14 Pro
  { width: 390, height: 844, ratio: 3 }, // 14, 13 Pro, 13, 12 Pro, 12
  { width: 375, height: 812, ratio: 3 }, // 13 mini, 12 mini, 11 Pro, XS, X
  { width: 375, height: 667, ratio: 2 }, // SE 3rd, SE 2nd, 8, 7, 6s
  { width: 768, height: 1024, ratio: 2 }, // iPad 9.7", iPad mini
];

const getStartupImageName = ({ width, height, ratio }: StartupDevice): string =>
  `${width * ratio}x${height * ratio}`;

const getStartupImageMedia = ({
  width,
  height,
  ratio,
}: StartupDevice): string =>
  `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`;

const getStartupImages = (page: string): StartupImage[] =>
  startupDevices.map((device) => ({
    url: `/startup-${page}-${getStartupImageName(device)}.png`,
    media: getStartupImageMedia(device),
  }));

export {
  startupDevices,
  getStartupImages,
  getStartupImageName,
  getStartupImageMedia,
};
export type { StartupDevice, StartupImage };
