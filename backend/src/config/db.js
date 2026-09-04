import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy unique index on hostel subdomain if it exists from earlier schemas
    try {
      const hostelCollection = conn.connection.collection('hostels');
      const indexes = await hostelCollection.indexes();
      const subdomainIndex = indexes.find(
        (idx) => idx.name === 'subdomain_1' || (idx.key && idx.key.subdomain)
      );
      if (subdomainIndex && subdomainIndex.unique) {
        console.log('🔄 Dropping legacy unique index on hostel subdomain...');
        await hostelCollection.dropIndex(subdomainIndex.name);
        await hostelCollection.createIndex({ subdomain: 1 }, { background: true });
        console.log('✅ Replaced unique subdomain index with standard non-unique index.');
      }
    } catch (indexErr) {
      console.warn('Note on index check:', indexErr.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};