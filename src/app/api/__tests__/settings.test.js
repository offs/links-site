import { GET, PUT } from '../settings/route';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import rateLimiter from '@/lib/rate-limit';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/mongodb');
jest.mock('@/lib/rate-limit');

describe('Settings API', () => {
  let mockCollection;
  let mockDb;
  let mockClient;

  beforeEach(() => {
    // Reset mocks
    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn()
    };
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    mockClient = {
      db: jest.fn().mockReturnValue(mockDb)
    };
    clientPromise.mockResolvedValue(mockClient);
    rateLimiter.mockResolvedValue(false); // Not rate limited by default

    // Mock session
    getServerSession.mockResolvedValue({
      user: {
        email: 'test@example.com',
        id: '123'
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns user settings when authenticated', async () => {
      const mockUser = {
        name: 'Test User',
        username: 'testuser',
        profileImage: '/test.jpg'
      };
      mockCollection.findOne.mockResolvedValue(mockUser);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        name: 'Test User',
        username: 'testuser',
        profileImage: '/test.jpg'
      });
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'test@example.com'
      });
    });

    it('returns 401 when not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it('returns 404 when user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
      expect(mockCollection.findOne).toHaveBeenCalled();
    });
  });

  describe('PUT', () => {
    it('updates username successfully', async () => {
      const mockRequest = new Request('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ username: 'newusername' })
      });

      mockCollection.findOne.mockResolvedValue(null); // No existing user with username
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('validates username format', async () => {
      const mockRequest = new Request('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ username: 'invalid@username' })
      });

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Username can only contain');
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('prevents duplicate usernames', async () => {
      const mockRequest = new Request('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ username: 'existing' })
      });

      mockCollection.findOne.mockResolvedValue({ _id: 'different-user' });

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Username already taken');
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('handles rate limiting', async () => {
      rateLimiter.mockResolvedValue(true); // Rate limited

      const mockRequest = new Request('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ username: 'test' })
      });

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many requests');
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });
  });
});
