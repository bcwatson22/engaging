import ReactMarkdown from "react-markdown";

import { formatExperience } from "@/utils/formatExperience";

type TIntro = {
  intro: string;
};

const Intro = ({ intro }: TIntro) => (
  <ReactMarkdown>{formatExperience(intro)}</ReactMarkdown>
);

export { Intro };
export type { TIntro };
