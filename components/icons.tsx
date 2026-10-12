import { HugeiconsIcon, type HugeiconsProps, type IconSvgElement } from "@hugeicons/react";
import {
Target02Icon, Copy01Icon, MoreHorizontalIcon, FileDownloadIcon,
Alert02Icon,
ArrowDown01Icon,
ArrowRight01Icon,
ArrowRight02Icon,
ArrowUp01Icon,
AtIcon,
BubbleChatIcon,
Cancel01Icon,
Clock01Icon,
CodeIcon,
CrownIcon,
Download01Icon,
FavouriteIcon,
GithubIcon,
Globe02Icon,
HashtagIcon,
Image01Icon,
InformationCircleIcon,
KeyboardIcon,
LinkSquare02Icon,
LockKeyIcon,
Login01Icon,
Logout01Icon,
Mail01Icon,
MountainIcon,
Notification02Icon,
PaintBoardIcon,
PaintBrush01Icon,
QuoteUpIcon,
RefreshIcon,
Search01Icon,
Settings01Icon,
ShoppingBag01Icon,
SlidersHorizontalIcon,
TextFontIcon,
Tick02Icon,
Timer01Icon,
Upload01Icon,
UserAdd01Icon,
UserIcon,
VolumeHighIcon,
Wrench01Icon
} from "@hugeicons/core-free-icons";

type Props = Omit<HugeiconsProps, "icon">;
function iconComponent(icon: IconSvgElement) {
  return function Icon({ size = 24, strokeWidth = 2.5, ...props }: Props) {
    return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} aria-hidden="true" data-icon-library="hugeicons" {...props} />;
  };
}

export const AlertTriangle = iconComponent(Alert02Icon);
export const ArrowRight = iconComponent(ArrowRight02Icon);
export const AtSign = iconComponent(AtIcon);
export const Check = iconComponent(Tick02Icon);
export const ChevronDown = iconComponent(ArrowDown01Icon);
export const ChevronRight = iconComponent(ArrowRight01Icon);
export const ChevronUp = iconComponent(ArrowUp01Icon);
export const Clock3 = iconComponent(Clock01Icon);
export const Code2 = iconComponent(CodeIcon);
export const Crown = iconComponent(CrownIcon);
export const Download = iconComponent(Download01Icon);
export const ExternalLink = iconComponent(LinkSquare02Icon);
export const Github = iconComponent(GithubIcon);
export const Globe = iconComponent(Globe02Icon);
export const Hash = iconComponent(HashtagIcon);
export const Heart = iconComponent(FavouriteIcon);
export const Image = iconComponent(Image01Icon);
export const Info = iconComponent(InformationCircleIcon);
export const Keyboard = iconComponent(KeyboardIcon);
export const LockKeyhole = iconComponent(LockKeyIcon);
export const LogIn = iconComponent(Login01Icon);
export const LogOut = iconComponent(Logout01Icon);
export const Mail = iconComponent(Mail01Icon);
export const MessageCircle = iconComponent(BubbleChatIcon);
export const Mountain = iconComponent(MountainIcon);
export const Paintbrush = iconComponent(PaintBrush01Icon);
export const Palette = iconComponent(PaintBoardIcon);
export const Quote = iconComponent(QuoteUpIcon);
export const RefreshCw = iconComponent(RefreshIcon);
export const RotateCw = iconComponent(RefreshIcon);
export const Search = iconComponent(Search01Icon);
export const Settings = iconComponent(Settings01Icon);
export const ShoppingBag = iconComponent(ShoppingBag01Icon);
export const SlidersHorizontal = iconComponent(SlidersHorizontalIcon);
export const Timer = iconComponent(Timer01Icon);
export const Type = iconComponent(TextFontIcon);
export const Upload = iconComponent(Upload01Icon);
export const UserPlus = iconComponent(UserAdd01Icon);
export const UserRound = iconComponent(UserIcon);
export const Volume2 = iconComponent(VolumeHighIcon);
export const Wrench = iconComponent(Wrench01Icon);
export const X = iconComponent(Cancel01Icon);
export const Bell = iconComponent(Notification02Icon);

export const Target = iconComponent(Target02Icon);
export const Copy = iconComponent(Copy01Icon);
export const MoreHorizontal = iconComponent(MoreHorizontalIcon);
export const FileDownload = iconComponent(FileDownloadIcon);
