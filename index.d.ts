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
};

type TPosition = {
  role: string;
  company: string;
};

type TScroll = {
  delay?: Orchestration["delay"];
  margin?: UseInViewOptions["margin"];
};

// type THome = TID &
//   TMeta & {
//     mugshot: TMugshot;
//     technologies: TTechnology[];
//   };

// type TCV = TID &
//   TMeta &
//   TLogo &
//   TIntro & {
//     address: TAddress;
//     contactLinks: TLink[];
//     gigs: TGig[];
//     skills: string;
//     qualifications: TQualification[];
//     onlineLinks: TLink[];
//     references: TReference[];
//   };
