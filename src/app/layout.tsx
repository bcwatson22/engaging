import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { CssVariable } from 'next/dist/compiled/@next/font';
import { Nunito } from 'next/font/google';
import { type ReactNode } from 'react';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Toggle } from '@/components/atoms/Toggle/Toggle';
import { Nav } from '@/components/molecules/Nav/Nav';
import { MotionProvider } from '@/components/providers/MotionProvider/MotionProvider';

import '@/styles/globals.css';

type Props = Readonly<{
  children: ReactNode;
}>;

const variable = '--font-nunito' as const satisfies CssVariable;

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-nunito' satisfies typeof variable,
});

const Layout = ({ children }: Props) => (
  <html lang="en-GB">
    <body className={nunito.className} suppressHydrationWarning>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <MotionProvider>
        <div className="flex min-h-screen flex-col">
          <header className="flex justify-center p-6 print:hidden">
            <Nav />
          </header>
          {children}
          <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-6 print:hidden">
            <Copyright />
            <Toggle />
          </footer>
        </div>
      </MotionProvider>
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
);

export default Layout;
export type { Props as LayoutProps };
