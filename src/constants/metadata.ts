import type { Metadata, Viewport } from "next";
import type { AppleWebApp } from "next/dist/lib/metadata/types/extra-types";

import { domainName, ogImageUrl } from "./common";

const appleWebApp: AppleWebApp = {
  statusBarStyle: "black-translucent",
};

const metadata: Metadata = {
  metadataBase: new URL(domainName),
  openGraph: {
    images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    type: "website",
    locale: "en_GB",
    url: domainName,
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  appleWebApp,
  manifest: "/manifest.webmanifest",
};

const themeColor = "#09090b";

const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export { metadata, viewport, appleWebApp, themeColor };
