import type { TTechnology } from "@/components/molecules/Technology/Technology";
import type { TMugshot } from "@/components/organisms/Mugshot/Mugshot";

export type THome = TID & {
  meta: TMeta;
  mugshot: TMugshot;
  technologies: TTechnology[];
};
