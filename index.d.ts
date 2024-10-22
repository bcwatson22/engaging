type Layout = Readonly<{
  children: ReactNode;
}>;

type ID = {
  id: string;
};

type Asset = ID & {
  url: string;
};

type Link = ID & {
  text: string;
  target: string;
};

type Position = {
  role: string;
  company: string;
};

type Gig = ID &
  Position & {
    capacity: string;
    city: string;
    logo: Asset;
    dates: string[];
    bullets: string[];
  };

type Qualification = {
  institution: string;
  location: string;
  dates: string[];
  description: string;
};

type Reference = Position & {
  person: string;
  link: Link;
};

type CV = {
  title: string;
  logo: Asset;
  intro: string;
  address: string;
  contactLinks: Link[];
  gigs: Gig[];
  skills: string[];
  qualifications: Qualification[];
  onlineLinks: Link[];
  references: Reference[];
};
