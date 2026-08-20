import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Particles } from '@/components/atoms/Particles/Particles';
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
  <main className="contact grow">
    <h1 className="sr-only">{title}</h1>
    <Suspense>
      <Particles
        color="var(--brand-blue)"
        colorDark="var(--brand-light)"
        opacity={0.55}
        opacityDark={0.3}
      />
    </Suspense>
    <Contact />
    <footer className="footer">
      <Copyright />
    </footer>
  </main>
);

export default ContactPage;
export { generateMetadata, viewport, title, description };
