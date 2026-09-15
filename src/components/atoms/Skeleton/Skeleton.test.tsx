import { cleanup, render, screen } from '@testing-library/react';

import {
  Skeleton,
  SkeletonHeading,
  SkeletonLine,
  SkeletonParagraph,
  SkeletonStatus,
  label,
} from './Skeleton';

const hiddenBlocks = (container: HTMLElement): NodeListOf<Element> =>
  container.querySelectorAll('.skeleton[aria-hidden="true"]');

describe('Skeleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a block hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);

    expect(hiddenBlocks(container)).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  describe('className', () => {
    it('is added when provided', () => {
      const { container } = render(<Skeleton className="mockClassName" />);

      expect(hiddenBlocks(container)[0]).toHaveClass(
        'skeleton',
        'mockClassName',
      );
    });
  });
});

describe('SkeletonStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('announces loading once', () => {
    render(<SkeletonStatus />);

    expect(screen.getByRole('status')).toHaveTextContent(label);
  });
});

describe('SkeletonLine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a hidden base line', () => {
    const { container } = render(<SkeletonLine />);

    expect(hiddenBlocks(container)[0]).toHaveClass('skeleton-line-base');
  });

  it('renders a hidden small line', () => {
    const { container } = render(<SkeletonLine size="small" />);

    expect(hiddenBlocks(container)[0]).toHaveClass('skeleton-line-small');
  });
});

describe('SkeletonHeading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a hidden heading-sized block', () => {
    const { container } = render(<SkeletonHeading />);

    expect(hiddenBlocks(container)[0]).toHaveClass('h2');
  });
});

describe('SkeletonParagraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a hidden line for each line asked for', () => {
    const numberOfLines = 7;

    const { container } = render(
      <SkeletonParagraph numOfLines={numberOfLines} />,
    );

    expect(hiddenBlocks(container)).toHaveLength(numberOfLines);
  });

  it('renders four lines by default', () => {
    const { container } = render(<SkeletonParagraph />);

    expect(hiddenBlocks(container)).toHaveLength(4);
  });

  describe('className', () => {
    it('renders if provided', () => {
      const mockClassName = 'mockClassName';

      const { container } = render(
        <SkeletonParagraph numOfLines={1} className={mockClassName} />,
      );

      expect(hiddenBlocks(container)[0].parentElement).toHaveClass(
        mockClassName,
      );
    });
  });
});
