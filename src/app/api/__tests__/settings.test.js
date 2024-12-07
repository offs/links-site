import { PUT } from '../settings/route';

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    }),
  },
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock the auth configuration
jest.mock('../auth/[...nextauth]/route', () => ({
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' },
  },
}));

// Mock MongoDB client
jest.mock('@/lib/mongodb', () => {
  const mockDb = {
    collection: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      updateOne: jest.fn(),
    }),
  };

  const mockClientPromise = {
    db: jest.fn().mockReturnValue(mockDb),
  };

  return {
    __esModule: true,
    default: mockClientPromise,
  };
});

describe('Settings API', () => {
  let mockRequest;
  let mockClientPromise;
  
  beforeEach(() => {
    mockRequest = {
      json: jest.fn(),
    };

    // Get fresh instance of the mock
    mockClientPromise = require('@/lib/mongodb').default;
    jest.clearAllMocks();
  });

  it('returns 401 when no session exists', async () => {
    const { getServerSession } = require('next-auth');
    getServerSession.mockResolvedValueOnce(null);

    mockRequest.json.mockResolvedValueOnce({});
    const response = await PUT(mockRequest);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('validates required fields in settings object', async () => {
    const { getServerSession } = require('next-auth');
    getServerSession.mockResolvedValueOnce({ user: { email: 'test@example.com' } });

    const invalidSettings = {
      displayName: '', // Empty display name
      bio: 'Test bio',
    };

    mockRequest.json.mockResolvedValueOnce(invalidSettings);
    const response = await PUT(mockRequest);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Display name is required' });
  });

  it('successfully updates user settings', async () => {
    const { getServerSession } = require('next-auth');
    getServerSession.mockResolvedValueOnce({ 
      user: { 
        email: 'test@example.com',
        id: 'test-user-id'
      } 
    });

    const validSettings = {
      displayName: 'Test User',
      bio: 'Test bio',
      theme: 'dark',
    };

    mockRequest.json.mockResolvedValueOnce(validSettings);
    const response = await PUT(mockRequest);
    expect(response.status).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.settings).toEqual(expect.objectContaining(validSettings));
    expect(responseData.settings.updatedAt).toBeDefined();
  });

  it('handles database errors gracefully', async () => {
    const { getServerSession } = require('next-auth');
    getServerSession.mockResolvedValueOnce({ 
      user: { 
        email: 'test@example.com',
        id: 'test-user-id'
      } 
    });

    // Mock a database error
    mockClientPromise.db.mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const validSettings = {
      displayName: 'Test User',
      bio: 'Test bio',
    };

    mockRequest.json.mockResolvedValueOnce(validSettings);
    const response = await PUT(mockRequest);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to update settings' });
  });
});
