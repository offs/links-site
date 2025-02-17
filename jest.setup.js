import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn()
    };
  },
  useParams() {
    return {};
  }
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession() {
    return { data: null, status: 'unauthenticated' };
  },
  signOut: jest.fn()
}));

// Mock Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} fill={undefined} />;
  }
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  NODE_ENV: 'test'
};
