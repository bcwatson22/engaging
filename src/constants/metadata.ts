import type { Metadata, Viewport } from "next";
import type { AppleWebApp } from "next/dist/lib/metadata/types/extra-types";

import { domainName, ogImageUrl } from "./common";

const appleWebApp: AppleWebApp = {
  // title: 'Apple Web App',
  statusBarStyle: "black-translucent",
  // startupImage: [
  //   "/assets/startup/apple-touch-startup-image-768x1004.png",
  //   // {
  //   //   url: "/assets/startup/apple-touch-startup-image-1536x2008.png",
  //   //   media: "(device-width: 768px) and (device-height: 1024px)",
  //   // },
  // ],
};

const metadata: Metadata = {
  openGraph: {
    images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    type: "website",
    // siteName: "Engaging Engineering",
    locale: "en_GB",
    url: domainName,
  },
  twitter: {
    card: "summary_large_image",
    // title: 'Next.js',
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  appleWebApp,
  manifest: "/manifest.json",
};

const themeColor = "#09090b";

const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export { metadata, viewport, appleWebApp, themeColor };
