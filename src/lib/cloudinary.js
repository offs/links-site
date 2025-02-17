import { v2 as cloudinary } from 'cloudinary';

const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingVars);
  throw new Error('Cloudinary configuration is incomplete. Required variables: ' + missingVars.join(', '));
}

try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Force HTTPS
  });
} catch (error) {
  console.error('Failed to initialize Cloudinary:', error);
  throw new Error('Cloudinary initialization failed');
}

export default cloudinary;
