import { NextResponse } from 'next/server';

export async function GET() {
  // Only show first few characters of sensitive data
  const uri = process.env.MONGODB_URI || 'not set';
  const maskedUri = uri === 'not set' ? 'not set' : `${uri.substring(0, 20)}...`;
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    mongodbUri: maskedUri,
  });
}
