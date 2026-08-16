import type { Metadata } from 'next';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Nav } from '@/components/molecules/Nav/Nav';
import { ContactForm } from '@/components/organisms/ContactForm/ContactForm';
import { metadata as shared, viewport } from '@/constants/metadata';

const title = 'Contact — Engaging Engineering';
const description =
  'Get in touch with Billy Watson about contract, permanent or consulting work.';

/* Static rather than CMS-driven: there is no contact model in Hygraph, and
   inventing one to hold two sentences would be a schema change in service of
   nothing. */
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
    <Nav />
    <ContactForm />
    <footer className="footer">
      <Copyright />
    </footer>
  </main>
);

export default ContactPage;
export { generateMetadata, viewport, title, description };
