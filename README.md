# Links Site

A modern, customizable link-in-bio platform built with Next.js 13, MongoDB, and Cloudinary.

![Next.js](https://img.shields.io/badge/Next.js-13-black)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue)

## Features

- 🔐 Secure authentication with NextAuth.js
- 🎨 Customizable themes and animations
- 📱 Fully responsive design
- 🖼️ Image upload with optimization
- 👤 User management for admins
- 🚀 Optimized for performance
- 🔗 Advanced link customization:
  - Social media icons
  - Custom colors and transparency
  - Font sizes and weights
  - Border styles and shadows
  - Custom opacity and animations

## Screenshots

<details>
  <summary>Click to expand</summary>

  ![Page](https://i.imgur.com/TyBE7je.png)
  ![User Settings](https://i.imgur.com/so20jyw.png)
  ![Links Settings](https://i.imgur.com/VBxgtzW.png)
  ![Theme Settings](https://i.imgur.com/6ZKiVT4.png)

</details>

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB database
- Cloudinary account

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_uri

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/              # App router pages and API routes
├── components/       # Reusable React components
├── lib/             # Utility functions and configurations
└── middleware.js    # NextAuth and route protection
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests
- `npm run analyze` - Analyze bundle size

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Deployment

1. Set up your MongoDB database
2. Configure Cloudinary credentials
3. Deploy to your preferred platform (Vercel recommended)
4. Set environment variables in your deployment platform

## Security

- All routes are protected with NextAuth.js
- Admin routes have additional middleware protection
- Image uploads are validated and optimized
- Rate limiting implemented for API routes
- Secure headers configured for production

## Performance

- Images optimized via Cloudinary
- Static assets cached and compressed
- Bundle size monitored and optimized
- Code splitting enabled by default

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
