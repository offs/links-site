'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import AddLinkForm from '@/components/AddLinkForm';
import LinkItem from '@/components/LinkItem';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [links, setLinks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [newLink, setNewLink] = useState({ 
    title: '', 
    url: '', 
    bgColor: 'bg-violet-500',
    icon: '',
    iconPosition: 'left',
    textColor: 'text-white',
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    opacity: 100,
    border: '',
    shadow: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const updateDisplayName = useCallback(
    debounce(async (newName) => {
      try {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: newName
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update name');
        }
        
        const { settings: updatedSettings } = await response.json();
        setSettings(updatedSettings);
        setDisplayName(newName);
        
        // Force a refresh to update the session
        router.refresh();
      } catch (error) {
        console.error('Error updating display name:', error);
      }
    }, 500),
    [router]
  );

  const updateUsername = useCallback(
    debounce(async (newUsername) => {
      try {
        setUsernameError(''); // Clear any previous errors
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: newUsername
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          setUsernameError(data.error);
          return;
        }
        
        const { settings: updatedSettings } = await response.json();
        setSettings(updatedSettings);
        setUsername(newUsername);
        
        // Force a refresh to update the session
        router.refresh();
      } catch (error) {
        console.error('Error updating username:', error);
        setUsernameError('Failed to update username');
      }
    }, 500),
    [router]
  );

  useEffect(() => {
    if (settings?.name) {
      setDisplayName(settings.name);
    }
  }, [settings?.name]);

  useEffect(() => {
    if (settings?.username) {
      setUsername(settings.username);
    }
  }, [settings?.username]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

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
    }
  }, [status, router]);

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1625]">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const saveLinks = async (updatedLinks) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLinks),
      });
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Error saving links:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleAddLink = (link) => {
    const linkToAdd = {
      ...link,
      url: link.url.startsWith('http') ? link.url : `https://${link.url}`,
      hoverColor: link.bgColor.replace('bg-', 'hover:bg-').replace('500', '600')
    };
    
    saveLinks([...links, linkToAdd]);
  };

  const handleUpdateLink = (updatedLink) => {
    const updatedLinks = [...links];
    updatedLinks[editingLink.index] = {
      ...updatedLink,
      url: updatedLink.url.startsWith('http') ? updatedLink.url : `https://${updatedLink.url}`,
      hoverColor: updatedLink.bgColor.replace('bg-', 'hover:bg-').replace('500', '600')
    };
    saveLinks(updatedLinks);
    setEditingLink(null);
  };

  const handleEditLink = (link, index) => {
    setEditingLink({ ...link, index });
  };

  const handleDeleteLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    saveLinks(updatedLinks);
  };

  const updateSetting = (key, value) => {
    const updatedSettings = { 
      ...settings, 
      theme: { ...settings.theme, [key]: value }
    };
    saveSettings(updatedSettings);
  };

  const handleImageChange = (imageUrl) => {
    saveSettings({ ...settings, profileImage: imageUrl });
  };

  const themes = [
    { name: 'Dark Purple', value: 'bg-[#1a1625]' },
    { name: 'Deep Ocean', value: 'bg-[#1a202c]' },
    { name: 'Midnight', value: 'bg-[#111827]' },
    { name: 'Forest', value: 'bg-[#064e3b]' },
    { name: 'Royal', value: 'bg-[#1e1b4b]' }
  ];

  const accents = ['violet', 'blue', 'emerald', 'amber', 'rose'];
  const buttonStyles = [
    { name: 'Rounded', value: 'rounded-xl' },
    { name: 'Pill', value: 'rounded-full' },
    { name: 'Subtle', value: 'rounded-lg' },
    { name: 'Sharp', value: 'rounded-none' }
  ];
  const animations = [
    { name: 'Scale', value: 'scale' },
    { name: 'Slide', value: 'slide' },
    { name: 'Glow', value: 'glow' }
  ];

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'appearance', name: 'Appearance' },
    { id: 'links', name: 'Links' }
  ];

  return (
    <div className={`min-h-screen ${settings.theme.background} text-white py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold text-${settings.theme.accent}-200`}>Settings</h1>
          <Link 
            href="/"
            className={`px-6 py-2.5 ${settings.theme.buttonStyle} bg-${settings.theme.accent}-600 hover:bg-${settings.theme.accent}-700 transition-colors text-white font-medium`}
          >
            Back to Profile
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id 
                  ? `bg-${settings.theme.accent}-600 text-white` 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white/5 rounded-xl p-8">
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                  <ImageUpload
                    currentImage={settings.profileImage}
                    onImageChange={handleImageChange}
                    accent={settings.theme.accent}
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        updateDisplayName(e.target.value);
                      }}
                      className="w-full p-3 rounded-lg bg-black/20 border border-white/10 focus:border-violet-400 outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        updateUsername(e.target.value);
                      }}
                      className={`w-full p-3 rounded-lg bg-black/20 border ${
                        usernameError ? 'border-red-500' : 'border-white/10'
                      } focus:border-violet-400 outline-none`}
                      placeholder="@username"
                    />
                    {usernameError && (
                      <p className="mt-2 text-sm text-red-400">{usernameError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <div className="bg-white/5 rounded-xl p-8">
                <h2 className="text-xl font-semibold mb-6">Theme Settings</h2>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-4">Background Theme</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {themes.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => updateSetting('background', theme.value)}
                          className={`p-4 rounded-lg ${theme.value} border-2 transition-all ${
                            settings.theme.background === theme.value
                              ? `border-${settings.theme.accent}-400 scale-[1.02]`
                              : 'border-transparent hover:border-white/20'
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4">Accent Color</label>
                    <div className="flex gap-3">
                      {accents.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSetting('accent', color)}
                          className={`w-12 h-12 rounded-full bg-${color}-500 transition-transform ${
                            settings.theme.accent === color
                              ? 'ring-2 ring-offset-4 ring-offset-[#1a1625] ring-white scale-110'
                              : 'hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4">Button Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {buttonStyles.map((style) => (
                        <button
                          key={style.value}
                          onClick={() => updateSetting('buttonStyle', style.value)}
                          className={`p-3 ${style.value} border-2 transition-all ${
                            settings.theme.buttonStyle === style.value
                              ? `border-${settings.theme.accent}-400 bg-${settings.theme.accent}-600`
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4">Button Animation</label>
                    <div className="grid grid-cols-3 gap-3">
                      {animations.map((anim) => (
                        <button
                          key={anim.value}
                          onClick={() => updateSetting('animation', anim.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            settings.theme.animation === anim.value
                              ? `border-${settings.theme.accent}-400 bg-${settings.theme.accent}-600`
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {anim.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Links Management */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Add New Link Form */}
              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Add New Link</h2>
                <AddLinkForm onAddLink={handleAddLink} />
              </div>

              {/* Existing Links */}
              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Your Links</h2>
                <div className="space-y-4">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <LinkItem {...link} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditLink(link, index)}
                          className="p-2 text-white/70 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLink(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingLink && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-[#1a1625] rounded-xl p-6 max-w-md w-full">
                    <h2 className="text-xl font-semibold mb-4">Edit Link</h2>
                    <AddLinkForm
                      initialValues={editingLink}
                      onAddLink={handleUpdateLink}
                      onCancel={() => setEditingLink(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Link Modal */}
      </div>
    </div>
  );
}
