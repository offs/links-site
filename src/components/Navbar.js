'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
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

    if (session) {
      checkAdminStatus();
    }
  }, [session]);

  if (!session) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-white font-medium">
          Links Site
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/settings"
            className="text-white/70 hover:text-white transition-colors"
          >
            Settings
          </Link>
          
          {isAdmin && (
            <Link 
              href="/admin"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}