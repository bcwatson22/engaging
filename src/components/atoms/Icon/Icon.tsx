import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  AtSymbolIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  HomeIcon,
  IdentificationIcon,
  RocketLaunchIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CookieIcon } from "@sidekickicons/react/24/outline";
import { ForwardRefExoticComponent, SVGProps } from "react";

const iconOptions = [
  "Cookie",
  "Cross",
  "Document",
  "Download",
  "Phone",
  "Email",
  "Home",
  "Profile",
  "Repo",
  "Retry",
  "User",
  "Website",
] as const;

type TIcon = (typeof iconOptions)[number];

type Props = {
  icon: TIcon;
  className?: string;
  isHidden?: boolean;
};

const iconMap: Record<
  TIcon,
  ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref">>
> = {
  Cookie: CookieIcon,
  Cross: XMarkIcon,
  Document: DocumentTextIcon,
  Download: ArrowDownTrayIcon,
  Email: AtSymbolIcon,
  Home: HomeIcon,
  Phone: DevicePhoneMobileIcon,
  Profile: IdentificationIcon,
  Repo: RocketLaunchIcon,
  Retry: ArrowPathIcon,
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
export type { TIcon, Props as IconProps };
