'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.isAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    const data = await signOut({ redirect: false, callbackUrl: '/' });
    router.push(data.url);
  };

  // Don't render anything while checking authentication
  if (status === 'loading') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1a1625] border-b border-white/10 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-white/90 transition-colors">
          Links Site
        </Link>
        
        <nav className="flex items-center gap-6">
          {status === 'authenticated' ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/settings"
                className="text-white hover:text-white/80 transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-white/80 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/api/auth/signin"
                className="text-white hover:text-white/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}