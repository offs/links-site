'use client';

import { useState, useEffect } from 'react';

const colors = [
  { name: 'Blue', value: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white' },
  { name: 'Purple', value: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-white' },
  { name: 'Green', value: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-white' },
  { name: 'Red', value: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-white' },
  { name: 'Gray', value: 'bg-gray-800', hover: 'hover:bg-gray-900', text: 'text-white' },
  { name: 'White', value: 'bg-white', hover: 'hover:bg-gray-50', text: 'text-gray-900' },
  { name: 'Transparent', value: 'bg-transparent', hover: 'hover:bg-white/10', text: 'text-white' },
];

const icons = [
  { name: 'None', value: '' },
  { name: 'GitHub', value: 'github' },
  { name: 'Twitter', value: 'twitter' },
  { name: 'LinkedIn', value: 'linkedin' },
  { name: 'Instagram', value: 'instagram' },
  { name: 'YouTube', value: 'youtube' },
  { name: 'Twitch', value: 'twitch' },
  { name: 'Facebook', value: 'facebook' },
  { name: 'TikTok', value: 'tiktok' },
  { name: 'Website', value: 'website' },
  { name: 'Email', value: 'email' },
  { name: 'Discord', value: 'discord' },
  { name: 'Spotify', value: 'spotify' },
  { name: 'Medium', value: 'medium' },
  { name: 'Dev.to', value: 'dev' },
  { name: 'Patreon', value: 'patreon' },
];

const fontSizes = [
  { name: 'Small', value: 'text-sm' },
  { name: 'Base', value: 'text-base' },
  { name: 'Large', value: 'text-lg' },
  { name: 'XL', value: 'text-xl' },
];

const fontWeights = [
  { name: 'Normal', value: 'font-normal' },
  { name: 'Medium', value: 'font-medium' },
  { name: 'Semibold', value: 'font-semibold' },
  { name: 'Bold', value: 'font-bold' },
];

const borders = [
  { name: 'None', value: '' },
  { name: 'Thin', value: 'border border-white/20' },
  { name: 'Medium', value: 'border-2 border-white/20' },
  { name: 'Thick', value: 'border-4 border-white/20' },
];

const shadows = [
  { name: 'None', value: '' },
  { name: 'Small', value: 'shadow-sm' },
  { name: 'Medium', value: 'shadow-md' },
  { name: 'Large', value: 'shadow-lg' },
  { name: 'Glow', value: 'shadow-lg shadow-white/10' },
];

export default function AddLinkForm({ onAddLink, initialValues = null, onCancel = null }) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [url, setUrl] = useState(initialValues?.url || '');
  const [bgColor, setBgColor] = useState(initialValues?.bgColor || 'bg-violet-500');
  const [icon, setIcon] = useState(initialValues?.icon || '');
  const [iconPosition, setIconPosition] = useState(initialValues?.iconPosition || 'left');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fontSize, setFontSize] = useState(initialValues?.fontSize || 'text-base');
  const [fontWeight, setFontWeight] = useState(initialValues?.fontWeight || 'font-medium');
  const [opacity, setOpacity] = useState(initialValues?.opacity || 100);
  const [border, setBorder] = useState(initialValues?.border || '');
  const [shadow, setShadow] = useState(initialValues?.shadow || '');

  // Update form when initialValues change (for editing)
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setUrl(initialValues.url || '');
      setBgColor(initialValues.bgColor || 'bg-violet-500');
      setIcon(initialValues.icon || '');
      setIconPosition(initialValues.iconPosition || 'left');
      setFontSize(initialValues.fontSize || 'text-base');
      setFontWeight(initialValues.fontWeight || 'font-medium');
      setOpacity(initialValues.opacity || 100);
      setBorder(initialValues.border || '');
      setShadow(initialValues.shadow || '');
    }
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) {
      return;
    }
    
    // Find the selected color or use default values
    const selectedColor = colors.find(color => color.value === bgColor) || {
      value: bgColor,
      hover: bgColor.replace('bg-', 'hover:bg-'),
      text: 'text-white'
    };

    onAddLink({
      title,
      url: url.startsWith('http') ? url : `https://${url}`,
      bgColor: selectedColor.value,
      hoverColor: selectedColor.hover,
      icon,
      iconPosition,
      textColor: selectedColor.text,
      fontSize,
      fontWeight,
      opacity,
      border,
      shadow
    });
    
    if (!initialValues) {
      // Only reset if we're not editing
      setTitle('');
      setUrl('');
      setBgColor('bg-violet-500');
      setIcon('');
      setIconPosition('left');
      setFontSize('text-base');
      setFontWeight('font-medium');
      setOpacity(100);
      setBorder('');
      setShadow('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-xl border border-white/10">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
            placeholder="Link Title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Icon</label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            {icons.map((iconOption) => (
              <option key={iconOption.value} value={iconOption.value}>
                {iconOption.name}
              </option>
            ))}
          </select>
        </div>

        {icon && (
          <div>
            <label className="block text-sm font-medium text-white mb-1">Icon Position</label>
            <select
              value={iconPosition}
              onChange={(e) => setIconPosition(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-1">Background Color</label>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setBgColor(color.value)}
                className={`w-full h-8 rounded-md ${color.value} ${
                  bgColor === color.value ? 'ring-2 ring-violet-500' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          {showAdvanced ? '- Hide Advanced Options' : '+ Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                {fontSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                {fontWeights.map((weight) => (
                  <option key={weight.value} value={weight.value}>
                    {weight.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Opacity ({opacity}%)
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Border Style</label>
              <select
                value={border}
                onChange={(e) => setBorder(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                {borders.map((borderOption) => (
                  <option key={borderOption.value} value={borderOption.value}>
                    {borderOption.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Shadow</label>
              <select
                value={shadow}
                onChange={(e) => setShadow(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2438] text-white rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                {shadows.map((shadowOption) => (
                  <option key={shadowOption.value} value={shadowOption.value}>
                    {shadowOption.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          {initialValues ? 'Save Changes' : 'Add Link'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
