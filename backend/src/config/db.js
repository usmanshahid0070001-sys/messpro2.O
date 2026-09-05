import mongoose from 'mongoose';

let _supportsTransactions = null;

export const supportsTransactions = async () => {
  if (_supportsTransactions !== null) {
    return _supportsTransactions;
  }
  try {
    const client = mongoose.connection.getClient();
    const topologyType = client?.topology?.description?.type;
    if (topologyType === 'Single') {
      _supportsTransactions = false;
      return false;
    }
    if (
      topologyType &&
      (topologyType.includes('ReplicaSet') ||
        topologyType === 'Sharded' ||
        topologyType === 'LoadBalanced')
    ) {
      _supportsTransactions = true;
      return true;
    }
    // Fallback: check via admin hello command
    if (mongoose.connection.db) {
      const hello = await mongoose.connection.db.admin().command({ hello: 1 }).catch(() => ({}));
      _supportsTransactions = Boolean(
        hello.setName ||
        hello.msg === 'isdbgrid' ||
        (Array.isArray(hello.hosts) && hello.hosts.length > 0)
      );
      return _supportsTransactions;
    }
  } catch {
    _supportsTransactions = false;
    return false;
  }
  _supportsTransactions = false;
  return false;
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Check transaction support
    const txSupported = await supportsTransactions();
    if (txSupported) {
      console.log('✅ Multi-document transactions: ENABLED (ReplicaSet / Mongos)');
    } else {
      console.log('ℹ️ Multi-document transactions: DISABLED (Standalone MongoDB - using compensating rollback)');
    }

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
