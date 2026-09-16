import ReactMarkdown from 'react-markdown';

import { formatExperience } from '@/utils/formatExperience';

type Intro = {
  intro: string;
};

const Intro = ({ intro }: Intro) => (
  <ReactMarkdown>{formatExperience(intro)}</ReactMarkdown>
);

export { Intro };
