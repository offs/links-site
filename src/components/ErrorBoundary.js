'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
    
    // Here you can add your error reporting service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1625] px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
          <p className="text-white/70">
            {process.env.NODE_ENV === 'development' 
              ? `Error: ${error.message}`
              : 'We apologize for the inconvenience. Please try again later.'}
          </p>
          <button
            onClick={() => {
              // Clear any cached state that might be causing the error
              window.sessionStorage.clear();
              reset();
            }}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
