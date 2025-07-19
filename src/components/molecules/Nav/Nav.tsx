import { Link, type TLink } from "@/components/atoms/Link/Link";

const links: TLink[] = [
  {
    target: "/",
    text: "Home",
    icon: "Home",
  },
  {
    target: "/cv/download",
    text: "Download",
    icon: "Download",
  },
];

const Nav = () => (
  <nav className="nav print:hidden">
    <ul>
      {links.map((link) => (
        <li key={link?.target}>
          <Link link={link} />
        </li>
      ))}
    </ul>
  </nav>
);

export { Nav };
