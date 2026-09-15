import { ViewTransition, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const directions = {
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  default: 'none',
};

const Transition = ({ children }: Props) => (
  <ViewTransition enter={directions} exit={directions} default="none">
    {children}
  </ViewTransition>
);

export { Transition };
export type { Props as TransitionProps };
