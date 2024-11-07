"use-client";

import dayjs from "dayjs";

type Props = Pick<CV, "intro">;

const Intro = ({ intro }: Props) => {
  const yearsOfExperience = dayjs().diff("2012-06-01", "year").toString();
  const formattedIntro = intro.replace("{{experience}}", yearsOfExperience);

  return <p className="text-sm print:text-xs">{formattedIntro}</p>;
};

export { Intro };
