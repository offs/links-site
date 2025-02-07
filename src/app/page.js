'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import LinkItem from "../components/LinkItem";
import { useSession } from 'next-auth/react';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

export default function Home() {
  const { data: session, status } = useSession();
  const [links, setLinks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, linksRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/links')
        ]);

        if (settingsRes.ok && linksRes.ok) {
          const [settingsData, linksData] = await Promise.all([
            settingsRes.json(),
            linksRes.json()
          ]);
          setSettings(settingsData);
          setLinks(linksData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1625]">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1625] py-16 px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome to Links Site</h1>
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-center"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="block px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-center"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const getAnimationClass = () => {
    switch (settings.theme.animation) {
      case 'scale':
        return 'hover:scale-[1.02]';
      case 'slide':
        return 'hover:translate-x-2';
      case 'glow':
        return 'hover:shadow-lg hover:shadow-violet-500/20';
      default:
        return 'hover:scale-[1.02]';
    }
  };

  const displayName = settings?.displayName || settings?.name || 'Your Name';

  return (
    <div className={`min-h-screen py-16 px-4 ${settings.theme.background}`}>
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={settings.profileImage || DEFAULT_PROFILE_IMAGE}
              alt="Profile Picture"
              fill
              className={`rounded-full object-cover border-2 border-${settings.theme.accent}-400/20`}
            />
          </div>
          <div>
            <h1 className={`text-2xl font-bold text-${settings.theme.accent}-200`}>
              {displayName}
            </h1>
            <p className={`text-${settings.theme.accent}-400`}>{settings.username}</p>
          </div>
        </div>
        
        <div className="space-y-4 px-4">
          {links.map((link, index) => (
            <LinkItem
              key={index}
              title={link.title}
              url={link.url}
              bgColor={link.bgColor}
              hoverColor={link.hoverColor}
              buttonStyle={settings.theme.buttonStyle}
              animation={getAnimationClass()}
              icon={link.icon}
              iconPosition={link.iconPosition}
              textColor={link.textColor}
              fontSize={link.fontSize}
              fontWeight={link.fontWeight}
              opacity={link.opacity}
              border={link.border}
              shadow={link.shadow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}