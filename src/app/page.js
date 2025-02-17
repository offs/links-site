'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSettingsNavigation = (tab) => {
    router.push('/settings');
    setTimeout(() => {
      window.location.hash = tab;
      window.scrollTo(0, 0);
    }, 100);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1625]">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1625]">
      
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Create Your Perfect <span className="text-violet-400">Link Page</span>
              </h1>
              <p className="text-xl text-gray-400">
                Share all your important links in one beautiful, customizable page. Perfect for creators, professionals, and anyone who wants to share more with their audience.
              </p>
              <div className="flex flex-wrap gap-4">
                {status === 'authenticated' ? (
                  <>
                    {session?.user?.username ? (
                      <Link
                        href={`/${session.user.username}`}
                        className="px-8 py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium"
                      >
                        View My Page
                      </Link>
                    ) : (
                      <Link
                        href="/settings#profile"
                        className="px-8 py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSettingsNavigation('profile');
                        }}
                      >
                        Create My Page
                      </Link>
                    )}
                    <Link
                      href="/settings#appearance"
                      className="px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSettingsNavigation('appearance');
                      }}
                    >
                      Customize Theme
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="px-8 py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
            <div className="relative h-[600px] hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-transparent rounded-3xl">
                <div className="absolute inset-0 backdrop-blur-3xl rounded-3xl"></div>
              </div>
              {/* Add a mockup or illustration here */}
              <div className="relative h-full flex items-center justify-center">
                <div className="w-[280px] h-[560px] bg-black/40 rounded-[40px] border-4 border-white/10 p-4">
                  <div className="w-full h-full bg-[#1a1625] rounded-[32px] p-6">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-violet-500/20 rounded-full mx-auto"></div>
                      <div className="h-6 bg-violet-500/20 rounded-full w-32 mx-auto"></div>
                      <div className="h-4 bg-violet-500/10 rounded-full w-24 mx-auto"></div>
                      <div className="space-y-3 mt-8">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-12 bg-violet-500/10 rounded-xl"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Custom Themes',
                description: 'Choose from a variety of themes and colors to match your brand.'
              },
              {
                title: 'Analytics',
                description: 'Track your page views and link clicks to understand your audience.'
              },
              {
                title: 'Easy to Use',
                description: 'Simple interface to manage your links and customize your page.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
