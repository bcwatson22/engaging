import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button, type ButtonProps } from './Button';

const setup = (props?: Partial<ButtonProps>) => ({
  user: userEvent.setup(),
  ...render(
    <Button icon="Send" {...props}>
      {props?.children ?? 'Send'}
    </Button>,
  ),
});

describe('Button', () => {
  it('is named by its text', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  /* A button inside a form submits it otherwise, which is the default nobody
     wants and everybody forgets. */
  it('does not submit unless asked to', () => {
    setup();

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('submits when asked to', () => {
    setup({ type: 'submit' });

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('calls what it was given', async () => {
    const onClick = vi.fn<() => void>();
    const { user } = setup({ onClick });

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call it while disabled', async () => {
    const onClick = vi.fn<() => void>();
    const { user } = setup({ onClick, disabled: true });

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(0);
  });

  /* The icon is decoration beside a label that already says the same thing,
     so it should not reach the accessibility tree. */
  it('hides its icon from assistive technology', () => {
    const { container } = setup();

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('keeps the styling when given a class of its own', () => {
    setup({ className: 'self-end' });

    expect(screen.getByRole('button')).toHaveClass('button', 'self-end');
  });
});
