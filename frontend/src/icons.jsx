import {
  Building2,
  HardHat,
  HeartPulse,
  Scale,
  Zap,
  ChartNoAxesCombined,
  TrendingUp,
  Boxes,
  Rocket,
  CircleCheck,
  Sparkles,
  Clock3,
  UsersRound,
  BadgeCheck,
  Mail,
  Phone,
  PhoneCall,
  MapPin,
  RotateCw,
  LogOut,
  FileText,
  Eye,
  Trash2,
  X,
  LockKeyhole,
  Menu,
  ArrowUpRight,
} from 'lucide-react';

// One maintained icon family; adjacent text names every action.
const icon = (Component) =>
  function Icon(props) {
    return (
      <Component
        size={24}
        strokeWidth={1.7}
        aria-hidden="true"
        focusable="false"
        {...props}
      />
    );
  };

export const IconArch = icon(Building2);
export const IconCivil = icon(HardHat);
export const IconMedical = icon(HeartPulse);
export const IconLaw = icon(Scale);
export const IconElec = icon(Zap);
export const IconMgmt = icon(ChartNoAxesCombined);
export const IconBD = icon(TrendingUp);
export const IconBIM = icon(Boxes);
export const IconStartups = icon(Rocket);
export const IconCheck = icon(CircleCheck);
export const IconStar = icon(Sparkles);
export const IconClock = icon(Clock3);
export const IconUsers = icon(UsersRound);
export const IconBadge = icon(BadgeCheck);
export const IconMail = icon(Mail);
export const IconPhone = icon(Phone);
export const IconPhoneCall = icon(PhoneCall);
export const IconPin = icon(MapPin);
export const IconRefresh = icon(RotateCw);
export const IconLogout = icon(LogOut);
export const IconDoc = icon(FileText);
export const IconEye = icon(Eye);
export const IconTrash = icon(Trash2);
export const IconClose = icon(X);
export const IconLock = icon(LockKeyhole);
export const IconMenu = icon(Menu);
export const IconArrow = icon(ArrowUpRight);
