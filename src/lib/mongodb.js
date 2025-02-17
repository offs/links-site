import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  compressors: ['zlib'],
};

const clientPromise = (async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Use global var in dev
      if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect()
          .catch(err => {
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.error('Failed to connect to MongoDB:', err);
            }
            throw err;
          });
      }
      return global._mongoClientPromise;
    } else {
      const client = new MongoClient(uri, options);
      
      if (process.env.NODE_ENV === 'development') {
        client.on('connectionPoolCreated', (_event) => {
          // eslint-disable-next-line no-console
          console.log('MongoDB connection pool created');
        });

        client.on('connectionPoolClosed', (_event) => {
          // eslint-disable-next-line no-console
          console.log('MongoDB connection pool closed');
        });
      }

      const connectWithRetry = async (retries = 5, interval = 5000) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await client.connect();
          } catch (err) {
            if (i === retries - 1) {
              throw err;
            }
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.error(`Failed to connect to MongoDB (attempt ${i + 1}/${retries}):`, err);
            }
            await new Promise(resolve => setTimeout(resolve, interval));
          }
        }
      };

      return connectWithRetry();
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', error);
    }
    throw error;
  }
})();

const cleanup = async () => {
  try {
    const client = await clientPromise;
    await client.close(true);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('MongoDB connection closed.');
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error closing MongoDB connection:', err);
    }
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

export default clientPromise;
