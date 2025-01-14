import type { TTechnology } from "@/components/molecules/Technology/Technology";
import type { TMugshot } from "@/components/organisms/Mugshot/Mugshot";

export type THome = TID &
  TMeta & {
    mugshot: TMugshot;
    technologies: TTechnology[];
  };
