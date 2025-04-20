import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// List all collections in the database
async function listCollections() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get connection details
    const db = mongoose.connection;
    console.log(`\nDatabase Information:`);
    console.log(`- Name: ${db.name}`);
    console.log(`- Host: ${db.host}`);
    console.log(`- Port: ${db.port}`);
    
    // Get all collections
    console.log('\nCollections in database:');
    const collections = await db.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
    } else {
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
      
      // Get collection stats for each collection
      console.log('\nCollection Statistics:');
      for (const collection of collections) {
        const stats = await db.db.command({ collStats: collection.name });
        const count = await db.collection(collection.name).countDocuments();
        console.log(`\n${collection.name}:`);
        console.log(`- Document count: ${count}`);
        console.log(`- Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`- Storage size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
        
        // Print sample document structure for each collection (first document only)
        if (count > 0) {
          const sampleDoc = await db.collection(collection.name).findOne({});
          console.log('- Document structure:');
          const fields = Object.keys(sampleDoc || {}).filter(key => key !== '_id');
          fields.forEach(field => {
            const type = Array.isArray(sampleDoc[field]) 
              ? 'Array' 
              : sampleDoc[field] === null 
                ? 'null'
                : typeof sampleDoc[field] === 'object' 
                  ? 'Object' 
                  : typeof sampleDoc[field];
            console.log(`  • ${field}: ${type}`);
          });
        }
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
listCollections(); 