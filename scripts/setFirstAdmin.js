const { MongoClient } = require('mongodb');
require('dotenv').config();

async function setFirstAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const userEmail = process.argv[2];
  if (!userEmail) {
    console.error('Please provide your email as an argument: node setFirstAdmin.js your@email.com');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('links-site');
    
    // Update user to be admin
    const result = await db.collection('users').updateOne(
      { email: userEmail.toLowerCase() },
      { $set: { isAdmin: true } }
    );

    if (result.matchedCount === 0) {
      console.error('User not found with email:', userEmail);
    } else if (result.modifiedCount === 0) {
      console.log('User is already an admin');
    } else {
      console.log('Successfully set user as admin');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

setFirstAdmin();
