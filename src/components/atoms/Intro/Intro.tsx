"use-client";

import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";

type TIntro = {
  intro: string;
};

const Intro = ({ intro }: TIntro) => {
  const yearsOfExperience = dayjs().diff("2012-06-01", "year").toString();
  const formattedIntro = intro.replace("{{experience}}", yearsOfExperience);

  return (
    <ReactMarkdown
    // components={{
    //   p(props) {
    //     const { node: _, ...rest } = props;

    //     return (
    //       <>
    //         <p {...rest} />
    //         <button id="btn-1">ImaButton!</button>
    //       </>
    //     );
    //   },
    // }}
    >
      {formattedIntro}
    </ReactMarkdown>
  );
};

export { Intro };
export type { TIntro };
