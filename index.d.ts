type TID = {
  id?: string;
  __typename?: string;
};

type TAsset = TID & {
  url: string;
};

type TMeta = {
  title: string;
  description: string;
  keywords: string[];
};

type TPosition = {
  role: string;
  company: string;
};

type TScroll = {
  delay?: Orchestration["delay"];
  margin?: UseInViewOptions["margin"];
};
