type ID = {
  id?: string;
  __typename?: string;
};

type Link =
  | (ID & {
      text: string;
      target: string;
      icon: Icon;
    })
  | null;

type Asset = ID & {
  url: string;
};

const iconOptions = [
  "Document",
  "Phone",
  "Email",
  "Website",
  "Profile",
  "Repo",
  "User",
] as const;

type Icon = (typeof iconOptions)[number];

type Mugshot = ID & {
  image: Asset;
  heading: string;
  description: string;
  links?: Link[];
};

type Technology = ID & {
  name: string;
  icon: Asset;
  link?: Link;
};

type Meta = {
  title: string;
  description: string;
};

type Home = ID &
  Meta & {
    mugshot: Mugshot;
    technologies: Technology[];
  };

type Address = ID & {
  streetAddress: string;
  locality: string;
  countryName: string;
  postalCode: string;
};

type Position = {
  role: string;
  company: string;
};

type Gig = ID &
  Pick<Position, "company"> & {
    city: string;
    logo: Asset;
    roles: Role[];
  };

type Role = ID &
  Pick<Position, "role"> & {
    dates: string[];
    bullets: string[];
    capacity: string;
  };

type Qualification = ID & {
  institution: string;
  location: string;
  dates: string[];
  description: string;
};

type Reference = ID &
  Position & {
    person: string;
    link: Link;
  };

type CV = ID &
  Meta & {
    logoLightBackground: Asset;
    logoDarkBackground: Asset;
    intro: string;
    address: Address;
    contactLinks: Link[];
    gigs: Gig[];
    skills: string;
    qualifications: Qualification[];
    onlineLinks: Link[];
    references: Reference[];
  };

type Scroll = {
  delay?: Orchestration["delay"];
  margin?: UseInViewOptions["margin"];
};
