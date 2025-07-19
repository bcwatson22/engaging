const macOSPlatforms = ["macOS", "Macintosh", "MacIntel", "MacPPC", "Mac68K"];
const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
const iOSPlatforms = ["iPhone", "iPad", "iPod"];

const detectOS = () => {
  const userAgent = window?.navigator.userAgent;
  const platform =
    window?.navigator?.userAgentData?.platform ?? window?.navigator.platform;

  let os = null;

  if (macOSPlatforms.includes(platform)) {
    os = "OSX";
  } else if (iOSPlatforms.includes(platform)) {
    os = "iOS";
  } else if (windowsPlatforms.includes(platform)) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (/Linux/.test(platform)) {
    os = "Linux";
  }

  return os;
};

export { detectOS };
