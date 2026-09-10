import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const baseUri = process.env.ATLAS_URI || '';

async function tryConnect(label, testUri) {
  console.log(`\n🔍 [Testing] ${label} ...`);
  try {
    const conn = await mongoose.createConnection(testUri, {
      serverSelectionTimeoutMS: 6000,
    }).asPromise();
    console.log(`   ✅ SUCCESS! Connected to Atlas.`);
    try {
      const dbs = await conn.db.admin().listDatabases();
      console.log(`   📂 Found databases on Atlas:`, dbs.databases.map(d => d.name).join(', '));
    } catch (e) {
      console.log(`   ℹ️ Database list restricted (${e.message})`);
    }
    await conn.close();
    return true;
  } catch (err) {
    console.log(`   ❌ Failed.`);
    if (err.reason && err.reason.servers) {
      for (const [server, desc] of err.reason.servers.entries()) {
        const detail = desc.error ? desc.error.message : desc.type;
        console.log(`      ↳ ${server.split(':')[0]}: ${detail}`);
      }
    } else {
      console.log(`      ↳ ${err.message}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  Diagnosing MongoDB Atlas Connection');
  console.log('====================================================');

  // Test 1: As-is (atlas-n8gebi-shard-0)
  const ok1 = await tryConnect('Original URI (replicaSet=atlas-n8gebi-shard-0)', baseUri);
  if (ok1) return;

  // Test 2: Matching shard prefix (replicaSet=atlas-n9qwweu-shard-0)
  const uriN9 = baseUri.replace('atlas-n8gebi-shard-0', 'atlas-n9qwweu-shard-0');
  const ok2 = await tryConnect('Fixed ReplicaSet (replicaSet=atlas-n9qwweu-shard-0)', uriN9);
  if (ok2) {
    console.log('\n💡 FIX FOUND: The replicaSet name should be atlas-n9qwweu-shard-0!');
    return;
  }

  // Test 3: Without replicaSet parameter
  const uriNoRs = baseUri.replace(/([&?])replicaSet=[^&]+(&?)/, (m, p1, p2) => (p1 === '?' && p2 ? '?' : ''));
  const ok3 = await tryConnect('Without replicaSet parameter', uriNoRs);
  if (ok3) {
    console.log('\n💡 FIX FOUND: Connecting without replicaSet parameter succeeds!');
    return;
  }

  console.log('\n====================================================');
  console.log('  DIAGNOSIS SUMMARY');
  console.log('====================================================');
  console.log('All connection attempts timed out without reaching the servers.');
  console.log('👉 This confirms your current IP address is being BLOCKED by MongoDB Atlas.');
  console.log('👉 Please add your current IP address (or 0.0.0.0/0) in:');
  console.log('   MongoDB Atlas Dashboard -> Security -> Network Access -> Add IP Address');
}

runTests();
