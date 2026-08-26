import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const HOSTEL_ID = '6a575ca8e08fdd210be19424';

// Minimal schemas matching backend models
const roomSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    occupants: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available',
    },
    cleaningDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);
roomSchema.index({ hostelId: 1, roomName: 1 }, { unique: true });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    id: { type: String, unique: true, trim: true, lowercase: true },
    hostelId: { type: String, required: true, trim: true, index: true },
    role: { type: String, enum: ['student', 'manager', 'admin', 'superadmin'], default: 'student' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    additionalInfo: [
      {
        key: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true },
      },
    ],
  },
  { timestamps: true }
);

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

/**
 * Helper to update or append key-value in additionalInfo array
 */
function updateAdditionalInfo(currentInfo = [], newEntries = {}) {
  const infoMap = new Map();
  for (const item of currentInfo) {
    if (item && item.key) {
      infoMap.set(item.key.trim().toLowerCase(), { key: item.key.trim(), value: item.value });
    }
  }

  for (const [key, value] of Object.entries(newEntries)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      infoMap.set(key.trim().toLowerCase(), {
        key: key.trim(),
        value: String(value).trim(),
      });
    }
  }

  return Array.from(infoMap.values());
}

/**
 * Main import runner
 * @param {Array<{rollNo: string, roomName: string, capacity?: number, cnic?: string, domicile?: string, name?: string}>} data 
 * @param {string} hostelId 
 */
export async function processHostelData(data, hostelId = HOSTEL_ID) {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected successfully. Processing ${data.length} records for Hostel ID: ${hostelId}\n`);

  try {
    const hostelObjectId = new mongoose.Types.ObjectId(hostelId);

    // ==========================================
    // STEP 1: Determine Room Capacities & Create Rooms
    // ==========================================
    console.log('--- STEP 1: Creating/Verifying Rooms ---');
    const roomCapacityMap = new Map();

    // Group by room to calculate capacity (or use explicitly provided capacity)
    for (const record of data) {
      const roomName = String(record.roomName || '').trim();
      if (!roomName) continue;

      const existingCap = roomCapacityMap.get(roomName) || 0;
      if (record.capacity && Number(record.capacity) > 0) {
        roomCapacityMap.set(roomName, Math.max(existingCap, Number(record.capacity)));
      } else {
        // If no explicit capacity, count students assigned to this room
        roomCapacityMap.set(roomName, existingCap + 1);
      }
    }

    const createdRooms = new Map(); // roomName -> Room Document

    for (const [roomName, capacity] of roomCapacityMap.entries()) {
      let room = await Room.findOne({ hostelId: hostelObjectId, roomName });
      if (!room) {
        room = await Room.create({
          hostelId: hostelObjectId,
          roomName,
          capacity: Math.max(1, capacity),
          occupants: 0,
          status: 'Available',
        });
        console.log(`  [Created Room] ${roomName} (Capacity: ${room.capacity})`);
      } else {
        // Ensure capacity is updated if larger
        if (room.capacity < capacity) {
          room.capacity = capacity;
          await room.save();
          console.log(`  [Updated Room Capacity] ${roomName} -> ${room.capacity}`);
        } else {
          console.log(`  [Existing Room Found] ${roomName} (Capacity: ${room.capacity})`);
        }
      }
      createdRooms.set(roomName, room);
    }

    // ==========================================
    // STEP 2 & 3: Update CNIC/Domicile & Allot Rooms
    // ==========================================
    console.log('\n--- STEP 2 & 3: Updating Additional Info & Allotting Rooms ---');

    let updatedStudentsCount = 0;
    let allottedStudentsCount = 0;
    let missingStudentsCount = 0;

    for (const record of data) {
      const rollNo = String(record.rollNo || '').trim().toLowerCase();
      const roomName = String(record.roomName || '').trim();
      const cnic = record.cnic ? String(record.cnic).trim() : null;
      const domicile = record.domicile ? String(record.domicile).trim() : null;

      if (!rollNo) {
        console.warn(`  [Warning] Skipping row with missing roll number.`);
        continue;
      }

      // Look up student by roll number (id)
      const student = await User.findOne({
        id: rollNo,
        hostelId: { $in: [hostelId, hostelObjectId.toString()] },
      });

      if (!student) {
        console.warn(`  [Not Found] Student with Roll No / ID '${rollNo}' was not found in hostel.`);
        missingStudentsCount++;
        continue;
      }

      // Update CNIC & Domicile in additionalInfo
      const additionalUpdates = {};
      if (cnic) additionalUpdates['CNIC'] = cnic;
      if (domicile) additionalUpdates['Domicile'] = domicile;

      student.additionalInfo = updateAdditionalInfo(student.additionalInfo, additionalUpdates);

      // Allot room if roomName provided
      if (roomName && createdRooms.has(roomName)) {
        const targetRoom = createdRooms.get(roomName);
        student.room = targetRoom._id;
        allottedStudentsCount++;
        console.log(`  [Allotted] ${student.name} (${student.id}) -> Room ${roomName} | CNIC: ${cnic || 'N/A'}, Domicile: ${domicile || 'N/A'}`);
      } else {
        console.log(`  [Updated Info Only] ${student.name} (${student.id}) | CNIC: ${cnic || 'N/A'}, Domicile: ${domicile || 'N/A'}`);
      }

      await student.save();
      updatedStudentsCount++;
    }

    // ==========================================
    // STEP 4: Recalculate Room Occupants & Status
    // ==========================================
    console.log('\n--- STEP 4: Recalculating Room Occupancies ---');
    for (const [roomName, roomDoc] of createdRooms.entries()) {
      const occupantsCount = await User.countDocuments({
        room: roomDoc._id,
        hostelId: { $in: [hostelId, hostelObjectId.toString()] },
      });

      roomDoc.occupants = occupantsCount;
      roomDoc.status = occupantsCount >= roomDoc.capacity ? 'Full' : 'Available';
      await roomDoc.save();

      console.log(`  Room ${roomName}: Occupants = ${roomDoc.occupants}/${roomDoc.capacity} (Status: ${roomDoc.status})`);
    }

    console.log('\n================ SUMMARY ================');
    console.log(`Total Rooms Configured : ${createdRooms.size}`);
    console.log(`Students Updated       : ${updatedStudentsCount}`);
    console.log(`Students Allotted      : ${allottedStudentsCount}`);
    console.log(`Students Not Found     : ${missingStudentsCount}`);
    console.log('=========================================\n');

  } catch (error) {
    console.error('Error during data import:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

/**
 * Simple CSV parser supporting standard headers: rollNo, roomName, capacity, cnic, domicile, name
 */
function parseCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  
  const rollIdx = headers.findIndex(h => h.includes('roll') || h === 'id');
  const roomIdx = headers.findIndex(h => h.includes('room'));
  const capIdx = headers.findIndex(h => h.includes('capacity') || h.includes('cap') || h.includes('bed'));
  const cnicIdx = headers.findIndex(h => h.includes('cnic') || h.includes('nic'));
  const domicileIdx = headers.findIndex(h => h.includes('domicile') || h.includes('district'));
  const nameIdx = headers.findIndex(h => h.includes('name'));

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    // Basic comma separation handling quotes
    const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    
    if (!cols || cols.length === 0) continue;

    records.push({
      rollNo: rollIdx >= 0 ? cols[rollIdx] : '',
      roomName: roomIdx >= 0 ? cols[roomIdx] : '',
      capacity: capIdx >= 0 && cols[capIdx] ? Number(cols[capIdx]) : undefined,
      cnic: cnicIdx >= 0 ? cols[cnicIdx] : '',
      domicile: domicileIdx >= 0 ? cols[domicileIdx] : '',
      name: nameIdx >= 0 ? cols[nameIdx] : '',
    });
  }

  return records;
}

// Check if running directly with a data file argument (e.g., node import-hostel-data.mjs data.csv/json)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let dataFilePath = args[0];

  if (!dataFilePath) {
    if (fs.existsSync(path.join(__dirname, 'hostel-data.csv'))) {
      dataFilePath = path.join(__dirname, 'hostel-data.csv');
    } else if (fs.existsSync(path.join(__dirname, 'hostel-data.json'))) {
      dataFilePath = path.join(__dirname, 'hostel-data.json');
    }
  }

  if (dataFilePath && fs.existsSync(dataFilePath)) {
    console.log(`Reading dataset from ${dataFilePath}...`);
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    let data;
    if (dataFilePath.endsWith('.csv')) {
      data = parseCsv(rawData);
    } else {
      data = JSON.parse(rawData);
    }
    processHostelData(data, HOSTEL_ID).catch(() => process.exit(1));
  } else {
    console.log(`No data file found at ${dataFilePath || 'hostel-data.csv / hostel-data.json'}.`);
    console.log(`Usage: node backend/scripts/import-hostel-data.mjs [path-to-file.csv|json]`);
  }
}
