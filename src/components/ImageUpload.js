import { useState, useRef } from 'react';
import Image from 'next/image';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

export default function ImageUpload({ currentImage, onImageChange, accent = 'violet' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const displayImage = currentImage || DEFAULT_PROFILE_IMAGE;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError('');

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadImage(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadImage(files[0]);
    }
  };

  const uploadImage = async (file) => {
    // Reset error state
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      onImageChange(data.filename);
      setError('');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative group cursor-pointer rounded-2xl aspect-square max-w-[200px] mx-auto overflow-hidden border-2 transition-all ${
          isDragging
            ? `border-${accent}-400 bg-${accent}-400/10`
            : error
            ? 'border-red-500 bg-red-500/5'
            : 'border-white/10 hover:border-white/30'
        }`}
      >
        <Image
          src={displayImage}
          alt="Profile"
          fill
          className="object-cover"
          sizes="200px"
          priority
        />
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
          <p className="text-white text-sm font-medium">Change Image</p>
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className={`w-8 h-8 border-2 border-white border-t-${accent}-400 rounded-full animate-spin`} />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="file-input"
      />
      {error ? (
        <p className="text-red-500 text-sm text-center">{error}</p>
      ) : (
        <p className="text-white/50 text-sm text-center">
          Supports JPG, PNG, GIF and WebP (max 5MB)
        </p>
      )}
    </div>
  );
}
