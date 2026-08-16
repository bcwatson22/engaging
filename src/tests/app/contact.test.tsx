import { cleanup, render, screen } from '@testing-library/react';

import ContactPage, {
  description,
  generateMetadata,
  title,
} from '@/app/contact/page';
import { ContactForm } from '@/components/organisms/ContactForm/ContactForm';

vi.mock('@/components/organisms/ContactForm/ContactForm', () => ({
  ContactForm:
    vi.fn<
      typeof import('@/components/organisms/ContactForm/ContactForm').ContactForm
    >(),
}));

const setup = () => render(<ContactPage />);

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders the form', () => {
    setup();

    expect(ContactForm).toHaveBeenCalledTimes(1);
  });

  it('gives the page a heading for assistive technology', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
  });

  it('offers a way back to the rest of the site', () => {
    setup();

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('describes the page for search and for sharing', () => {
    const meta = generateMetadata();

    expect(meta.title).toBe(title);
    expect(meta.description).toBe(description);
  });

  it('carries the shared open graph image through', () => {
    const meta = generateMetadata();

    expect(meta.openGraph).toMatchObject({ title, description });
    expect(meta.twitter).toMatchObject({ title, description });
  });
});
