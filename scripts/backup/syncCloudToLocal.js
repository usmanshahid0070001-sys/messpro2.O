import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Load Environment Variables ──────────────────────────────────────────────
// Priority 1: scripts/backup/.env
dotenv.config({ path: path.join(__dirname, '.env') });
// Priority 2: fallback to backend/.env
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

// Parse CLI Arguments
const args = process.argv.slice(2);
const isDropMode = args.includes('--drop') || args.includes('--mirror') || args.includes('--clean');
const dbArg = args.find((a) => a.startsWith('--db=') || a.startsWith('--source='));
const sourceDbOverride = dbArg ? dbArg.split('=')[1].trim() : process.env.CLOUD_DB_NAME;

const targetDbArg = args.find((a) => a.startsWith('--target=') || a.startsWith('--target-db='));
const targetDbOverride = targetDbArg ? targetDbArg.split('=')[1].trim() : null;

const collectionsArg = args.find((a) => a.startsWith('--collections='));
const filterCollections = collectionsArg
  ? collectionsArg.split('=')[1].split(',').map((c) => c.trim().toLowerCase())
  : null;

// ─── Connection URIs ─────────────────────────────────────────────────────────
const DEFAULT_ATLAS_URI =
  'mongodb://localhostuser:ZNa6eE0oLJgZOKXr@ac-n9qwweu-shard-00-00.tnjpzra.mongodb.net:27017,ac-n9qwweu-shard-00-01.tnjpzra.mongodb.net:27017,ac-n9qwweu-shard-00-02.tnjpzra.mongodb.net:27017/messpro_saas?ssl=true&authSource=admin&replicaSet=atlas-n8gebi-shard-0&retryWrites=true&w=majority';

const rawAtlasUri = process.env.ATLAS_URI || DEFAULT_ATLAS_URI;

// Determine source Cloud Atlas URI
let CLOUD_URI = rawAtlasUri;
if (sourceDbOverride) {
  CLOUD_URI = rawAtlasUri.replace(
    /(mongodb(?:\+srv)?:\/\/[^/]+\/)([^?]*)/,
    `$1${sourceDbOverride}`
  );
}

let LOCAL_URI =
  process.env.LOCAL_MESSPRO_URI ||
  process.env.LOCAL_URI ||
  'mongodb://127.0.0.1:27017/messpro_saas';

if (targetDbOverride) {
  LOCAL_URI = LOCAL_URI.replace(
    /(mongodb(?:\+srv)?:\/\/[^/]+\/)([^?]*)/,
    `$1${targetDbOverride}`
  );
}

// Default core collections expected in MessPro SaaS
const KNOWN_COLLECTIONS = [
  'hostels',
  'hostelrequests',
  'users',
  'auths',
  'residences',
  'rooms',
  'meals',
  'mealschedules',
  'mealrecords',
  'mealprices',
  'plans',
  'bills',
  'complaints',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pad(n) {
  return String(n).padStart(2, '0');
}

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function log(msg) {
  console.log(`[${timestamp()}]  ${msg}`);
}

function maskUri(uri) {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1******$3');
}

// ─── Main Synchronization Routine ────────────────────────────────────────────
async function syncCloudToLocal() {
  let cloudConn;
  let localConn;

  const startTime = Date.now();
  console.log('');
  log('🚀  Starting Cloud MongoDB (Atlas) → Local MongoDB Synchronization…');
  log(`   Source (Cloud) → ${maskUri(CLOUD_URI)}`);
  log(`   Target (Local) → ${maskUri(LOCAL_URI)}`);
  log(`   Mode           → ${isDropMode ? 'MIRROR (Drop Local & Replace from Cloud)' : 'SAFE UPSERT (Preserve Local & Update by _id)'}`);
  if (filterCollections) {
    log(`   Collections    → [${filterCollections.join(', ')}]`);
  }
  console.log('');

  try {
    // 1. Connect to Cloud MongoDB (Atlas)
    log('🔌  Connecting to Cloud MongoDB (Atlas)…');
    const cloudOptions = {
      serverSelectionTimeoutMS: 30_000,
    };
    if (
      CLOUD_URI.includes('ssl=true') ||
      CLOUD_URI.includes('tls=true') ||
      CLOUD_URI.startsWith('mongodb+srv://')
    ) {
      cloudOptions.tls = true;
    }

    cloudConn = await mongoose
      .createConnection(CLOUD_URI, cloudOptions)
      .asPromise();
    log('✅  Connected to Cloud MongoDB (Atlas).');

    // 2. Connect to Local MongoDB
    log('🔌  Connecting to Local MongoDB…');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    log('✅  Connected to Local MongoDB.');
    console.log('');

    // 3. Discover all cloud collections
    const cloudDb = cloudConn.db;
    const existingCollections = await cloudDb.listCollections().toArray();
    const existingNames = existingCollections
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'));

    log(`📋  Discovered collections in Cloud DB: [${existingNames.join(', ')}]`);

    // Merge discovered collections with known collections
    let targetCollections = [
      ...new Set([...KNOWN_COLLECTIONS, ...existingNames]),
    ].filter((name) => existingNames.includes(name));

    if (filterCollections) {
      targetCollections = targetCollections.filter((c) => filterCollections.includes(c));
    }

    console.log('');

    // 4. Synchronize Each Collection from Cloud to Local
    const results = [];
    const BATCH_SIZE = 500;

    for (const colName of targetCollections) {
      const cloudCol = cloudConn.collection(colName);
      const localCol = localConn.collection(colName);

      const totalDocs = await cloudCol.countDocuments();
      log(`📦  Syncing collection "${colName}" (${totalDocs} cloud documents)…`);

      if (totalDocs === 0) {
        if (isDropMode) {
          await localCol.deleteMany({});
          log(`   ↳ Collection is empty in Cloud. Cleared local collection.`);
        } else {
          log(`   ↳ Collection is empty in Cloud. Skipped.`);
        }
        results.push({ collection: colName, status: 'empty', synced: 0, total: 0 });
        continue;
      }

      try {
        // Fetch all documents from Cloud
        const docs = await cloudCol.find({}).toArray();

        if (isDropMode) {
          // Drop & Insert Mode on Local
          await localCol.deleteMany({});
          let inserted = 0;
          for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            const batch = docs.slice(i, i + BATCH_SIZE);
            const res = await localCol.insertMany(batch, { ordered: false });
            inserted += res.insertedCount;
          }
          log(`   ✅  Inserted ${inserted} / ${totalDocs} documents into local DB (Mirror mode).`);
          results.push({ collection: colName, status: 'ok', created: inserted, updated: 0, unchanged: 0, total: totalDocs });
        } else {
          // Safe Upsert Mode (Replaces matching _id or inserts if missing)
          let createdCount = 0;
          let updatedCount = 0;
          let unchangedCount = 0;
          for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            const batch = docs.slice(i, i + BATCH_SIZE);
            const ops = batch.map((doc) => ({
              replaceOne: {
                filter: { _id: doc._id },
                replacement: doc,
                upsert: true,
              },
            }));
            const res = await localCol.bulkWrite(ops, { ordered: false });
            const upserted = res.upsertedCount || 0;
            const modified = res.modifiedCount || 0;
            const matched = res.matchedCount || 0;
            createdCount += upserted;
            updatedCount += modified;
            unchangedCount += Math.max(0, matched - modified);
          }
          log(`   ✅  Processed ${docs.length} documents: ${createdCount} created, ${updatedCount} updated, ${unchangedCount} unchanged.`);
          results.push({ collection: colName, status: 'ok', created: createdCount, updated: updatedCount, unchanged: unchangedCount, total: totalDocs });
        }

        // Copy collection indexes from cloud to local (excluding default _id index)
        try {
          const indexes = await cloudCol.indexes();
          const customIndexes = indexes.filter((idx) => idx.name !== '_id_');
          for (const idx of customIndexes) {
            const keys = idx.key;
            const options = { name: idx.name };
            if (idx.unique) options.unique = true;
            if (idx.sparse) options.sparse = true;
            if (idx.expireAfterSeconds !== undefined) options.expireAfterSeconds = idx.expireAfterSeconds;
            await localCol.createIndex(keys, options);
          }
        } catch (idxErr) {
          // Non-fatal index creation warning
          log(`   ⚠️   Notice: index sync for "${colName}" had note: ${idxErr.message}`);
        }
      } catch (colErr) {
        console.error(`   ❌  Failed to sync collection "${colName}":`, colErr.message);
        results.push({ collection: colName, status: 'error', created: 0, updated: 0, unchanged: 0, total: totalDocs, error: colErr.message });
      }
    }

    // ─── Summary Table ────────────────────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('');
    console.log('═'.repeat(80));
    console.log('  MESS PRO CLOUD (ATLAS) → LOCAL DATABASE SYNC SUMMARY');
    console.log('═'.repeat(80));
    console.log(
      `  ${'Collection'.padEnd(20)} ${'Status'.padEnd(10)} ${'Created'.padEnd(12)} ${'Updated'.padEnd(12)} ${'Unchanged'.padEnd(12)} Total`
    );
    console.log('─'.repeat(80));

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalUnchanged = 0;
    let totalProcessed = 0;

    for (const r of results) {
      const icon =
        r.status === 'ok'    ? '✅' :
        r.status === 'empty' ? '🔵' : '❌';
      console.log(
        `  ${icon} ${r.collection.padEnd(17)} ${r.status.padEnd(10)} ${String(r.created ?? 0).padEnd(12)} ${String(r.updated ?? 0).padEnd(12)} ${String(r.unchanged ?? 0).padEnd(12)} ${r.total}`
      );
      totalCreated += r.created || 0;
      totalUpdated += r.updated || 0;
      totalUnchanged += r.unchanged || 0;
      totalProcessed += (r.created || 0) + (r.updated || 0) + (r.unchanged || 0);
    }

    console.log('─'.repeat(80));
    console.log(`  Total documents created   : ${totalCreated}`);
    console.log(`  Total documents updated   : ${totalUpdated}`);
    console.log(`  Total documents unchanged : ${totalUnchanged}`);
    console.log(`  Total documents processed : ${totalProcessed}`);
    console.log(`  Sync mode                 : ${isDropMode ? 'Mirror (Clean Local & Replace)' : 'Upsert (Preserve Local & Update by _id)'}`);
    console.log(`  Time elapsed              : ${elapsed}s`);
    console.log('═'.repeat(80));
    console.log('');
    log('🎉  Atlas to Local synchronization completed successfully!');
  } catch (err) {
    console.error('');
    console.error('❌  Synchronization failed with an unexpected error:');
    console.error(err);
    process.exit(1);
  } finally {
    if (cloudConn) {
      await cloudConn.close();
      log('🔒  Cloud connection closed.');
    }
    if (localConn) {
      await localConn.close();
      log('🔒  Local connection closed.');
    }
  }
}

// Execute
syncCloudToLocal();
