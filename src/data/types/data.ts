import type { CV } from './cv';
import type { Home } from './home';

type HomesData = {
  homes: Home[];
};

type CVData = {
  cvs: CV[];
};

export type Data = {
  data: HomesData | CVData;
};
