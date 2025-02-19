'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import AddLinkForm from '@/components/AddLinkForm';
import LinkItem from '@/components/LinkItem';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = async (...args) => {
  const res = await fetch(...args);
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function Settings() {
  const { status } = useSession();
  const router = useRouter();
  const [editingLink, setEditingLink] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: ''
  });
  const [profileCooldown, setProfileCooldown] = useState(false);
  const [settingsCooldown, setSettingsCooldown] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, mutate: mutateSettings, isLoading: settingsLoading } = useSWR('/api/settings', fetcher);
  const { data: links = [], mutate: mutateLinks, isLoading: linksLoading } = useSWR('/api/links', fetcher);

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        username: settings.username || ''
      });
    }
  }, [settings]);

  useEffect(() => {
    const hasNameChange = formData.name !== settings?.name;
    const hasUsernameChange = formData.username !== settings?.username;
    setHasChanges(hasNameChange || hasUsernameChange);
  }, [formData, settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSaveChanges = async () => {
    if (settingsCooldown) {
      setError('Please wait 5 minutes before updating name/username');
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      mutateSettings();
      router.refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      setSettingsCooldown(true);
      setTimeout(() => setSettingsCooldown(false), 5 * 60 * 1000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleImageChange = async (imageUrl) => {
    if (profileCooldown) {
      setError('Please wait 5 minutes before updating profile image');
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: imageUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile image');
      }

      mutateSettings();
      router.refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      setProfileCooldown(true);
      setTimeout(() => setProfileCooldown(false), 5 * 60 * 1000);
    } catch (error) {
      setError(error.message);
    }
  };

  const saveLinks = async (updatedLinks) => {
    try {
      setError('');
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLinks),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save links');
      }

      await mutateLinks();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      setError(error.message || 'Failed to save links');
    }
  };

  const handleAddLink = (link) => {
    const linkToAdd = {
      ...link,
      url: link.url.startsWith('http') || link.url.startsWith('mailto:') ? link.url : `https://${link.url}`
    };

    saveLinks([...links, linkToAdd]);
  };

  const handleUpdateLink = (updatedLink) => {
    const updatedLinks = [...links];
    updatedLinks[editingLink.index] = {
      ...updatedLink,
      url: updatedLink.url.startsWith('http') || updatedLink.url.startsWith('mailto:') ? updatedLink.url : `https://${updatedLink.url}`
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', `#${tabId}`);
  };

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return;
  }

  if (settingsLoading || linksLoading) {
    return (
      <div className="page">
        <div className="container flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="page">
        <div className="container flex flex-col items-center justify-center">
          <h1 className="title mb-4">Error Loading Settings</h1>
          <p className="text-gray-400 mb-8">Unable to load your settings. Please try again.</p>
          <button onClick={() => mutateSettings()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'links', name: 'Links' }
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h1 className="title">Settings</h1>
          <Link
            href={`/${settings.username}`}
            prefetch={false}
            className="btn-primary"
          >
            Back to Profile
          </Link>
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`tab ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="card-title">Profile Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                  <ImageUpload
                    currentImage={settings.profileImage}
                    onImageChange={handleImageChange}
                    accent="violet"
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="label">Display Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`input ${error ? 'input-error' : ''}`}
                      placeholder="username"
                      disabled={settingsCooldown}
                    />
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        {error && (
                          <p className="text-error">{error}</p>
                        )}
                        {success && (
                          <p className="text-success">
                            Settings updated successfully
                          </p>
                        )}
                        {(settingsCooldown || profileCooldown) && !error && !success && (
                          <p className="text-warning">
                            Changes are limited to once every 5 minutes
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSaveChanges}
                        disabled={settingsCooldown || !hasChanges}
                        className={settingsCooldown || !hasChanges ? 'btn-disabled' : 'btn-primary'}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="card-title">Add New Link</h2>
                <AddLinkForm onAddLink={handleAddLink} />
              </div>

              <div className="card">
                <h2 className="card-title">Your Links</h2>
                <div className="space-y-4">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4 flex-grow">
                        <LinkItem 
                          {...link}
                          bgColor={link.bgColor}
                          hoverColor={link.hoverColor}
                          textColor={link.textColor}
                          fontSize={link.fontSize}
                          fontWeight={link.fontWeight}
                          opacity={link.opacity}
                          border={link.border}
                          shadow={link.shadow}
                        />
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
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
                  <div className="card max-w-md w-full">
                    <h2 className="card-title">Edit Link</h2>
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
      </div>
    </div>
  );
}
