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
    <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-white">Links Site</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
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
                {session?.user?.username && (
                  <Link
                    href={`/${session.user.username}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    My Page
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
