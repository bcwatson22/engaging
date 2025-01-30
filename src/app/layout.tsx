import type { ReactNode } from "react";

import type { CssVariable } from "next/dist/compiled/@next/font";
import { Nunito } from "next/font/google";

import "@/styles/globals.css";

type Props = Readonly<{
  children: ReactNode;
}>;

const variable = "--font-sans" as const satisfies CssVariable;

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans" satisfies typeof variable,
});

const Layout = ({ children }: Props) => (
  <html lang="en">
    <body className={nunito.className}>{children}</body>
  </html>
);

export default Layout;
export type { Props as LayoutProps };
