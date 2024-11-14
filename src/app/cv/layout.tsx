import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../../styles/globals.css";

import { type CssVariable } from "next/dist/compiled/@next/font";

const variable = "--font-sans" as const satisfies CssVariable;

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans" satisfies typeof variable,
});

export const metadata: Metadata = {
  title: `Billy Watson CV`,
  description: `Jolly good show what`,
};

const RootLayout = ({ children }: Layout) => (
  <html lang="en">
    <body className={`cv ${nunito.className}`}>{children}</body>
  </html>
);

export default RootLayout;
