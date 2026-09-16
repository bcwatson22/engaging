/// <reference types="react/canary" />

type ID = {
  id?: string;
  __typename?: string;
};

type Asset = ID & {
  url: string;
};

type Meta = ID & {
  title: string;
  description: string;
  keywords: string[];
};

type Position = {
  role: string;
  company: string;
};

type Scroll = {
  delay?: Orchestration['delay'];
  margin?: UseInViewOptions['margin'];
  amount?: UseInViewOptions['amount'];
  isImmediate?: boolean;
};
