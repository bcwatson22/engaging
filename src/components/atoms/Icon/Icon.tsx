import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CubeIcon,
  AtSymbolIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  HomeIcon,
  IdentificationIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserIcon,
  XMarkIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { ForwardRefExoticComponent, SVGProps } from 'react';

const iconOptions = [
  'Cross',
  'Document',
  'Download',
  'Email',
  'Home',
  'Lightbulb',
  'Package',
  'Phone',
  'Profile',
  'Pencil',
  'Repo',
  'Retry',
  'Send',
  'Sparkles',
  'User',
  'Website',
] as const;

type TIcon = (typeof iconOptions)[number];

type Props = {
  icon: TIcon;
  className?: string;
  isHidden?: boolean;
};

const iconMap: Record<
  TIcon,
  ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, 'ref'>>
> = {
  Cross: XMarkIcon,
  Document: DocumentTextIcon,
  Download: ArrowDownTrayIcon,
  Email: AtSymbolIcon,
  Home: HomeIcon,
  Lightbulb: LightBulbIcon,
  Package: CubeIcon,
  Phone: DevicePhoneMobileIcon,
  Profile: IdentificationIcon,
  Pencil: PencilSquareIcon,
  Repo: RocketLaunchIcon,
  Retry: ArrowPathIcon,
  Send: PaperAirplaneIcon,
  Sparkles: SparklesIcon,
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
