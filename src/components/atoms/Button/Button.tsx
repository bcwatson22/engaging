import type { ComponentPropsWithRef, ReactNode } from 'react';

import { Icon, type TIcon } from '@/components/atoms/Icon/Icon';

type Props = ComponentPropsWithRef<'button'> & {
  icon: TIcon;
  children: ReactNode;
};

/* type defaults to "button". A button inside a form submits it otherwise,
   which is the default nobody wants and everybody forgets. */
const Button = ({
  icon,
  children,
  type = 'button',
  className,
  ...rest
}: Props) => (
  <button
    type={type}
    className={['button', className].filter(Boolean).join(' ')}
    {...rest}
  >
    <Icon icon={icon} className="vector" />
    <span>{children}</span>
  </button>
);

export { Button };
export type { Props as ButtonProps };
