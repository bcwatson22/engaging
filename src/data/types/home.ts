import type { Technology } from '@/components/molecules/Technology/Technology';
import type { Mugshot } from '@/components/organisms/Mugshot/Mugshot';

export type Home = ID & {
  meta: Meta;
  mugshot: Mugshot;
  technologies: Technology[];
};
