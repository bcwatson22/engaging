import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Particles } from '@/components/atoms/Particles/Particles';
import { Nav } from '@/components/molecules/Nav/Nav';
import { Contact } from '@/components/organisms/Contact/Contact';
import { metadata as shared, viewport } from '@/constants/metadata';

const title = 'Contact | Engaging Engineering';
const description =
  'Get in touch with us about contract, permanent or consulting work.';

const generateMetadata = (): Metadata => ({
  title,
  description,
  ...shared,
  openGraph: {
    ...shared.openGraph,
    title,
    description,
  },
  twitter: {
    ...shared.twitter,
    title,
    description,
  },
});

const ContactPage = () => (
  <main className="contact main">
    <h1 className="sr-only">{title}</h1>
    <Suspense>
      {/* Brand blue on a light background, brand light on a dark one — the
          same pairing the link atom uses. A single colour cannot work here
          the way it does on the home page, which is always dark. */}
      <Particles color="#245385" colorDark="#f9fafb" />
    </Suspense>
    <Nav className="flex justify-center" />
    <Contact />
    <footer className="footer">
      <Copyright />
    </footer>
  </main>
);

export default ContactPage;
export { generateMetadata, viewport, title, description };
