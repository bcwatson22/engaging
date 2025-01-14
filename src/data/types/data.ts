import type { TCV } from "./cv";
import type { THome } from "./home";

type HomesData = {
  homes: THome[];
};

type CVData = {
  cvs: TCV[];
};

export type TData = {
  data: HomesData | CVData;
};
