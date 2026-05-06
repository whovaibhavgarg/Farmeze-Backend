#!/usr/bin/env node

// Quick connection test script
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB Atlas connection...');
console.log('Connection URI:', process.env.MONGODB_URI);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('Database name:', mongoose.connection.db.databaseName);

  // List collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Existing collections:', collections.map(c => c.name));

  await mongoose.connection.close();
  console.log('✅ Connection test completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your cluster name in the connection string');
  console.log('2. Make sure your IP address is whitelisted in MongoDB Atlas');
  console.log('3. Verify your username and password are correct');
  console.log('4. Ensure your cluster is running (not paused)');
  process.exit(1);
}