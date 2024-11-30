import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { type CssVariable } from "next/dist/compiled/@next/font";
import { Nunito } from "next/font/google";

import "@/styles/globals.css";

type Layout = Readonly<{
  children: ReactNode;
}>;

const variable = "--font-sans" as const satisfies CssVariable;

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans" satisfies typeof variable,
});

const Layout = ({ children }: Layout) => (
  <html lang="en">
    <body className={nunito.className}>{children}</body>
    <SpeedInsights />
  </html>
);

export default Layout;
