import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backup directory
dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Config ──────────────────────────────────────────────────────────────────
const LOCAL_URI = process.env.LOCAL_MESSPRO_URI || 'mongodb://127.0.0.1:27017/messpro_saas';

// Build Atlas URI pointing to the "backupMessPro" database
const rawAtlasUri = process.env.ATLAS_URI;
if (!rawAtlasUri) {
  console.error('❌  ATLAS_URI is not set in scripts/backup/.env');
  process.exit(1);
}

// Replace whatever database name is in the Atlas URI with "backupMessPro"
const ATLAS_BACKUP_URI = rawAtlasUri.replace(
  /(mongodb(?:\+srv)?:\/\/[^/]+\/)([^?]*)/,
  '$1backupMessPro'
);

// ─── Collections to back up ───────────────────────────────────────────────────
// These are the raw MongoDB collection names (pluralised, lowercase).
// Add any new collection names here as the app grows.
const COLLECTIONS_TO_BACKUP = [
  'hostels',
  'users',
  'mealrecords',
  'meals',
  'plans',
  'residences',
  'rooms',
  'auths',
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

// ─── Main backup function ─────────────────────────────────────────────────────
async function backupMessPro() {
  let localConn;
  let atlasConn;

  const startTime = Date.now();
  log('🚀  Starting MessPro database backup…');
  log(`   Source  → ${LOCAL_URI}`);
  log(`   Target  → ${ATLAS_BACKUP_URI}`);
  console.log('');

  try {
    // ── Connect ──────────────────────────────────────────────────────────────
    log('🔌  Connecting to local MongoDB (messpro_saas)…');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    log('✅  Connected to local MongoDB.');

    log('🔌  Connecting to MongoDB Atlas (backupMessPro)…');
    atlasConn = await mongoose
      .createConnection(ATLAS_BACKUP_URI, {
        tls: true,
        serverSelectionTimeoutMS: 30_000,
      })
      .asPromise();
    log('✅  Connected to MongoDB Atlas.');
    console.log('');

    // ── Discover all collections in the local DB ──────────────────────────────
    const localDb = localConn.db;
    const existingCollections = await localDb.listCollections().toArray();
    const existingNames = existingCollections.map((c) => c.name);

    log(`📋  Collections found in local DB: [${existingNames.join(', ')}]`);

    // Merge: predefined list + any extra collections in the DB
    const allCollections = [
      ...new Set([...COLLECTIONS_TO_BACKUP, ...existingNames]),
    ];

    console.log('');

    // ── Backup each collection ────────────────────────────────────────────────
    const results = [];

    for (const collectionName of allCollections) {
      if (!existingNames.includes(collectionName)) {
        log(`⚠️   Skipping "${collectionName}" — not found in local DB.`);
        results.push({ collection: collectionName, status: 'skipped', count: 0 });
        continue;
      }

      try {
        const localCol = localConn.collection(collectionName);
        const atlasCol = atlasConn.collection(collectionName);

        // Count source docs
        const totalDocs = await localCol.countDocuments();
        log(`📦  Backing up "${collectionName}" (${totalDocs} documents)…`);

        if (totalDocs === 0) {
          log(`   ↳ Empty collection — clearing Atlas copy and moving on.`);
          await atlasCol.deleteMany({});
          results.push({ collection: collectionName, status: 'empty', count: 0 });
          continue;
        }

        // Fetch all docs from local
        const docs = await localCol.find({}).toArray();

        // Wipe Atlas copy and replace with fresh backup
        await atlasCol.deleteMany({});
        const insertResult = await atlasCol.insertMany(docs, { ordered: false });

        log(`   ✅  Inserted ${insertResult.insertedCount} / ${totalDocs} documents.`);
        results.push({
          collection: collectionName,
          status: 'ok',
          count: insertResult.insertedCount,
        });
      } catch (colErr) {
        console.error(`   ❌  Failed to back up "${collectionName}":`, colErr.message);
        results.push({ collection: collectionName, status: 'error', count: 0 });
      }
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('');
    console.log('═'.repeat(60));
    console.log('  BACKUP SUMMARY');
    console.log('═'.repeat(60));
    console.log(
      `  ${'Collection'.padEnd(22)} ${'Status'.padEnd(10)} ${'Docs'}`
    );
    console.log('─'.repeat(60));

    let totalCopied = 0;
    for (const r of results) {
      const icon =
        r.status === 'ok'      ? '✅' :
        r.status === 'skipped' ? '⚠️ ' :
        r.status === 'empty'   ? '🔵' : '❌';
      console.log(
        `  ${icon}  ${r.collection.padEnd(20)} ${r.status.padEnd(10)} ${r.count}`
      );
      totalCopied += r.count;
    }

    console.log('─'.repeat(60));
    console.log(`  Total documents backed up : ${totalCopied}`);
    console.log(`  Time elapsed              : ${elapsed}s`);
    console.log('═'.repeat(60));
    console.log('');
    log('🎉  Backup completed successfully!');
  } catch (err) {
    console.error('');
    console.error('❌  Backup failed with an unexpected error:');
    console.error(err);
    process.exit(1);
  } finally {
    if (localConn) {
      await localConn.close();
      log('🔒  Local connection closed.');
    }
    if (atlasConn) {
      await atlasConn.close();
      log('🔒  Atlas connection closed.');
    }
  }
}

backupMessPro();
