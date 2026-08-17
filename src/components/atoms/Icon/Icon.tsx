import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  CubeIcon,
  AtSymbolIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
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
  'Check',
  'CheckCircle',
  'Copy',
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
  'Warning',
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
  Check: CheckIcon,
  /* A circled tick, distinct from the bare `Check` the copy button uses: the
     status page is reporting a state, not confirming an action. */
  CheckCircle: CheckCircleIcon,
  Copy: ClipboardDocumentIcon,
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
  Warning: ExclamationTriangleIcon,
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
