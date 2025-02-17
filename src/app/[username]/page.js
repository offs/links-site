'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import LinkItem from "@/components/LinkItem";
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

export default function ProfilePage() {
  const { username } = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`/api/profile/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          }
          return;
        }

        const data = await response.json();
        if (data) {
          setProfile(data.settings);
          setLinks(data.links);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Profile fetch error:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="page">
        <div className="container flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page">
        <div className="container flex flex-col items-center justify-center">
          <h1 className="title mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-8">The user @{username} does not exist.</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (links.length === 0) {
    return (
      <div className="page">
        <div className="container flex flex-col items-center justify-center">
          <h1 className="title mb-4">No Links Found</h1>
          <p className="text-gray-400 mb-8">This user has not added any links yet.</p>
          {session?.user?.id === profile.userId && (
            <Link href="/settings" className="btn-primary">
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === profile.userId;
  
  return (
    <div className="page">
      <div className="container max-w-md space-y-8">
        {isOwnProfile && (
          <div className="flex justify-end">
            <Link href="/settings" className="btn-primary">
              Edit Profile
            </Link>
          </div>
        )}
        
        <div className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={profile.profileImage || DEFAULT_PROFILE_IMAGE}
              alt="Profile Picture"
              fill
              className="rounded-full object-cover border-2 border-violet-400/20"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-violet-200">
              {profile.displayName || profile.name}
            </h1>
            <p className="text-violet-400">@{profile.username}</p>
          </div>
        </div>
        
        <div className="space-y-4 px-4">
          {links.map((link, index) => (
            <LinkItem
              key={index}
              {...link}
              className="rounded-xl hover:scale-[1.02] transition-transform"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
