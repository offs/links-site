'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUpload({ currentImage, onImageChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const timeoutRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (!file) {
      return 'No file selected';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG and WebP images are allowed';
    }
    if (file.size > MAX_SIZE) {
      return 'Image must be less than 5MB';
    }
    return null;
  }, []);

  const createPreview = useCallback((file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageUpload = useCallback(async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setError('');
      createPreview(file);

      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      setUploadProgress(100);
      const data = await response.json();
      onImageChange(data.url);
      
      timeoutRef.current = setTimeout(() => {
        setPreview(null);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      setError(error.message || 'Failed to upload image. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Image upload error:', error);
      }
    } finally {
      setUploading(false);
    }
  }, [validateFile, createPreview, onImageChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer?.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="relative max-w-sm mx-auto">
      <div
        className={`
          group relative w-40 h-40 mx-auto
          border-3 border-dashed rounded-full
          overflow-hidden cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-violet-400 bg-violet-400/10 scale-105' 
            : error 
              ? 'border-red-400 bg-red-400/5' 
              : 'border-white/20 hover:border-violet-400/50 hover:bg-violet-400/5'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Image
          src={preview || currentImage || '/default-profile.png'}
          alt="Profile Picture"
          fill
          className={`
            object-cover transition-transform duration-300
            ${isDragging ? 'scale-105 opacity-50' : 'group-hover:scale-105'}
          `}
        />

        <div className={`
          absolute inset-0 flex flex-col items-center justify-center
          bg-black/0 group-hover:bg-black/40
          transition-all duration-300
          ${isDragging ? 'bg-black/40' : ''}
        `}>
          <svg
            className={`w-8 h-8 mb-2 transition-all duration-300
              ${isDragging ? 'scale-110 text-violet-400' : 'text-white/0 group-hover:text-white/90'}
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className={`
            text-sm font-medium transition-all duration-300
            ${isDragging ? 'text-violet-400' : 'text-white/0 group-hover:text-white/90'}
          `}>
            Drop to upload
          </span>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="w-20 h-20 relative">
              <svg className="animate-spin w-full h-full text-violet-400" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  className="opacity-75"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={Math.PI * 20}
                  strokeDashoffset={(Math.PI * 20) * (1 - uploadProgress / 100)}
                  transform="rotate(-90 12 12)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                {uploadProgress}%
              </span>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        id="imageUpload"
        className="hidden"
        accept={ALLOWED_TYPES.join(',')}
        data-testid="file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
          }
        }}
      />

      <label
        htmlFor="imageUpload"
        className={`
          block mt-4 text-sm text-center
          py-2 px-4 rounded-lg
          transition-all duration-300
          ${error 
            ? 'text-red-400 hover:text-red-300' 
            : 'text-white/70 hover:text-white hover:bg-white/5'}
          cursor-pointer
        `}
      >
        {error ? 'Try again' : 'Choose image'}
      </label>

      <p className="mt-2 text-xs text-center text-white/50">
        JPEG, PNG or WebP, max 5MB
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-400 text-center animate-fadeIn" data-testid="error-message">
          {error}
        </p>
      )}
    </div>
  );
}
