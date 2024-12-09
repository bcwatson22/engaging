"use-client";

import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";

type Props = Pick<CV, "intro">;

const Intro = ({ intro }: Props) => {
  const yearsOfExperience = dayjs().diff("2012-06-01", "year").toString();
  const formattedIntro = intro.replace("{{experience}}", yearsOfExperience);

  return <ReactMarkdown>{formattedIntro}</ReactMarkdown>;
};

export { Intro };
export type { Props as IntroProps };
