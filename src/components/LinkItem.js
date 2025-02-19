import { 
  FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, 
  FaTwitch, FaFacebook, FaTiktok, FaGlobe, FaEnvelope,
  FaDiscord, FaSpotify, FaMedium, FaDev, FaPatreon
} from 'react-icons/fa';

const ICON_MAP = {
  github: FaGithub,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitch: FaTwitch,
  facebook: FaFacebook,
  tiktok: FaTiktok,
  website: FaGlobe,
  email: FaEnvelope,
  discord: FaDiscord,
  spotify: FaSpotify,
  medium: FaMedium,
  dev: FaDev,
  patreon: FaPatreon
};

export default function LinkItem({ 
  title, 
  url, 
  icon = null,
  iconPosition = 'left',
  bgColor = 'bg-violet-500',
  hoverColor = 'hover:bg-violet-600',
  textColor = 'text-white',
  fontSize = 'text-base',
  fontWeight = 'font-medium',
  opacity = 100,
  border = '',
  shadow = '',
  className = ''
}) {
  const IconComponent = icon ? ICON_MAP[icon.toLowerCase()] : null;
  
  const opacityClass = opacity < 100 ? `opacity-${opacity}` : '';
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        block w-full 
        ${bgColor} ${hoverColor}
        ${textColor} ${fontSize} ${fontWeight}
        py-4 px-6
        transition-all duration-200
        flex items-center justify-center gap-2
        rounded-xl
        ${opacityClass}
        ${border}
        ${shadow}
        ${className}
      `}
    >
      {IconComponent && iconPosition === 'left' && (
        <IconComponent className="w-5 h-5" />
      )}
      <span>{title}</span>
      {IconComponent && iconPosition === 'right' && (
        <IconComponent className="w-5 h-5" />
      )}
    </a>
  );
}
