import {
  DevicePhoneMobileIcon,
  AtSymbolIcon,
  GlobeAltIcon,
  UserIcon,
  IdentificationIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { ForwardRefExoticComponent, SVGProps } from "react";

type Props = {
  icon: Icon;
};

const getVector = (
  icon: Icon
): ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref">> => {
  switch (icon) {
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

const Icon = ({ icon }: Props) => {
  const Component = getVector(icon);

  return <Component />;
};

export { Icon };
