type Layout = Readonly<{
  children: ReactNode;
}>;

type ID = {
  id: string;
};

type Link = ID & {
  text: string;
  target: string;
  icon: Icon;
};

type Asset = ID & {
  url: string;
};

type Icon = "Document" | "Phone" | "Email" | "Website" | "Profile" | "Repo";

type Mugshot = {
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

type Home = ID & {
  title: string;
  description: string;
  mugshot: Mugshot;
  technologies: Technology[];
};

type Address = {
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

type CV = {
  title: string;
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
