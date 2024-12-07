'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/admin/users');
          if (response.ok) {
            const users = await response.json();
            const currentUser = users.find(user => user.email === session.user.email);
            setIsAdmin(currentUser?.isAdmin || false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [session]);

  if (status === 'loading') return null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1a1625] border-b border-white/10 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-white/90 transition-colors">
          Links Site
        </Link>
        
        <nav className="flex items-center gap-6">
          {session ? (
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
              <Link
                href="/api/auth/signout"
                className="text-white hover:text-white/80 transition-colors"
              >
                Sign Out
              </Link>
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