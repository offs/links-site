import { GET, PUT } from '../admin/settings/route';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { authRateLimiter } from '@/lib/rate-limit';

jest.mock('next-auth');
jest.mock('@/lib/mongodb');
jest.mock('@/lib/rate-limit');

describe('Admin Settings API', () => {
  let mockCollection;
  let mockDb;
  let mockClient;

  beforeEach(() => {
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
    authRateLimiter.mockResolvedValue(true);
  });

  describe('GET', () => {
    it('returns default settings when none exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        registrationEnabled: true,
        disallowedDomains: []
      });
    });

    it('returns existing settings', async () => {
      const mockSettings = {
        registrationEnabled: false,
        disallowedDomains: ['spam.com']
      };
      mockCollection.findOne.mockResolvedValue(mockSettings);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSettings);
    });
  });

  describe('PUT', () => {
    const mockRequest = (body) => new Request('http://localhost:3000/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { isAdmin: true }
      });
    });

    it('updates registration setting', async () => {
      const updates = {
        registrationEnabled: false
      };

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCollection.findOne.mockResolvedValue(updates);

      const response = await PUT(mockRequest(updates));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.registrationEnabled).toBe(false);
    });

    it('updates disallowed domains', async () => {
      const updates = {
        disallowedDomains: ['spam.com', 'temp.com']
      };

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCollection.findOne.mockResolvedValue(updates);

      const response = await PUT(mockRequest(updates));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.disallowedDomains).toEqual(['spam.com', 'temp.com']);
    });

    it('validates disallowed domains', async () => {
      const updates = {
        disallowedDomains: ['invalid', 'spam.com', 'test with space.com', 'ok.com']
      };

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCollection.findOne.mockResolvedValue({
        disallowedDomains: ['spam.com', 'ok.com']
      });

      const response = await PUT(mockRequest(updates));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.disallowedDomains).toEqual(['spam.com', 'ok.com']);
    });

    it('rejects non-array disallowedDomains', async () => {
      const response = await PUT(mockRequest({
        disallowedDomains: 'not an array'
      }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('disallowedDomains must be an array');
    });

    it('rejects non-admin users', async () => {
      getServerSession.mockResolvedValue({
        user: { isAdmin: false }
      });

      const response = await PUT(mockRequest({ registrationEnabled: false }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

    it('handles rate limiting', async () => {
      authRateLimiter.mockResolvedValue(false);

      const response = await PUT(mockRequest({ registrationEnabled: false }));
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.message).toBe('Too many requests');
    });
  });
});
