import {
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  AtSymbolIcon,
  GlobeAltIcon,
  UserIcon,
  IdentificationIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { ForwardRefExoticComponent, SVGProps } from "react";

export type Icon =
  | "Document"
  | "Phone"
  | "Email"
  | "Website"
  | "Profile"
  | "Repo";

type Props = {
  icon: Icon;
  className?: string;
};

const getVector = (
  icon: Icon
): ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref">> => {
  switch (icon) {
    case "Document":
      return DocumentTextIcon;
    case "Phone":
      return DevicePhoneMobileIcon;
    case "Email":
      return AtSymbolIcon;
    case "Website":
      return GlobeAltIcon;
    case "Profile":
      return IdentificationIcon;
    case "Repo":
      return RocketLaunchIcon;
    default:
      return UserIcon;
  }
};

export const Icon = ({ icon, className }: Props) => {
  const Component = getVector(icon);

  return <Component className={className} />;
};
