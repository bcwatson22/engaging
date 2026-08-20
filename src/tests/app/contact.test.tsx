import { cleanup, render, screen } from '@testing-library/react';

import ContactPage, {
  description,
  generateMetadata,
  title,
} from '@/app/(site)/contact/page';
import { Particles } from '@/components/atoms/Particles/Particles';
import { Contact } from '@/components/organisms/Contact/Contact';

vi.mock('@/components/organisms/Contact/Contact', () => ({
  Contact:
    vi.fn<typeof import('@/components/organisms/Contact/Contact').Contact>(),
}));

vi.mock('@/components/atoms/Particles/Particles', () => ({
  Particles:
    vi.fn<typeof import('@/components/atoms/Particles/Particles').Particles>(),
}));

const setup = () => render(<ContactPage />);

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders the form', () => {
    setup();

    expect(Contact).toHaveBeenCalledTimes(1);
  });

  it('gives the page a heading for assistive technology', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
  });

  it('carries the same particle field as the home page', () => {
    setup();

    expect(Particles).toHaveBeenCalledTimes(1);
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
