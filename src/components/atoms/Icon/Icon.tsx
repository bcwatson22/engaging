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

const iconOptions = [
  "Document",
  "Phone",
  "Email",
  "Website",
  "Profile",
  "Repo",
  "User",
] as const;

type IconOption = (typeof iconOptions)[number];

type Props = {
  icon: IconOption;
  className?: string;
  isHidden?: boolean;
};

const iconMap: Record<
  IconOption,
  ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref">>
> = {
  Document: DocumentTextIcon,
  Email: AtSymbolIcon,
  Phone: DevicePhoneMobileIcon,
  Profile: IdentificationIcon,
  Repo: RocketLaunchIcon,
  User: UserIcon,
  Website: GlobeAltIcon,
};

const Icon = ({ icon, className, isHidden = true }: Props) => {
  const Component = iconMap[icon];

  return (
    <Component
      className={className}
      role="graphics-symbol"
      aria-label={icon}
      aria-hidden={isHidden}
    />
  );
};

export { Icon, iconOptions };
export type { Props as IconProps };
