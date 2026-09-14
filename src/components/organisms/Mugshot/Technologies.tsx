'use client';

import { type ReactNode, useEffect, useState } from 'react';

type Props = {
  children: ReactNode;
};

const Technologies = ({ children }: Props) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setDismissed(true);
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <ul
      className="technologies"
      data-dismissed={dismissed || undefined}
      onPointerLeave={() => setDismissed(false)}
    >
      {children}
    </ul>
  );
};

export { Technologies };
export type { Props as TechnologiesProps };
