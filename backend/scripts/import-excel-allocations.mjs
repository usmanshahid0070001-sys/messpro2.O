import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const HOSTEL_ID = '6a575ca8e08fdd210be19424';
const DEFAULT_FILE_PATH = 'E:\\hostel\\Student Allocation Template.xlsx';

// Try to locate xlsx module across workspace
let xlsx;
try {
  xlsx = require('xlsx');
} catch (e1) {
  try {
    xlsx = require(path.join(__dirname, '../../frontend-ts/node_modules/xlsx'));
  } catch (e2) {
    try {
      xlsx = require(path.join(__dirname, '../../node_modules/xlsx'));
    } catch (e3) {
      console.error('Could not find xlsx module in backend or frontend-ts node_modules.');
    }
  }
}

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
 * Format string or number cleanly (avoid scientific notation, handle floats like 1.0 or CNICs)
 */
function cleanString(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  
  // If float like "1.0", convert to "1"
  if (/^\d+\.0$/.test(str)) {
    str = str.replace(/\.0$/, '');
  }
  
  // Handle scientific notation for large numbers like CNIC: 3.52011e+12
  if (/^[+\-]?(?:\d+\.?\d*|\.\d+)[eE][+\-]?\d+$/.test(str)) {
    try {
      const num = Number(str);
      if (!isNaN(num)) {
        str = BigInt(Math.floor(num)).toString();
      }
    } catch (e) {
      // Keep as string
    }
  }

  return str;
}

/**
 * Check if a room name is valid (not empty, placeholder, or N/A)
 */
function isValidRoomName(name) {
  if (!name) return false;
  const clean = String(name).trim().toLowerCase();
  return clean !== '' && clean !== '-' && clean !== '--' && clean !== 'n/a' && clean !== 'na' && clean !== 'null' && clean !== 'none';
}

/**
 * Update or append key-value in additionalInfo array (case-insensitive key match)
 */
function updateAdditionalInfo(currentInfo = [], newEntries = {}) {
  const infoMap = new Map();
  for (const item of currentInfo || []) {
    if (item && item.key) {
      infoMap.set(item.key.trim().toLowerCase(), { key: item.key.trim(), value: item.value });
    }
  }

  for (const [key, value] of Object.entries(newEntries)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      const cleanVal = cleanString(value);
      if (cleanVal) {
        infoMap.set(key.trim().toLowerCase(), {
          key: key.trim(),
          value: cleanVal,
        });
      }
    }
  }

  return Array.from(infoMap.values());
}

/**
 * Read and normalize excel rows with comprehensive header detection
 */
function readExcelFile(filePath) {
  if (!xlsx) {
    throw new Error('XLSX package is required to read Excel files. Please check node_modules/xlsx.');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found at: ${filePath}`);
  }

  console.log(`[Excel] Loading file from: ${filePath}`);
  const workbook = xlsx.readFile(filePath, { cellText: false, cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Read with header row auto-detected or standard json
  const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: '', raw: false });
  console.log(`[Excel] Loaded sheet "${firstSheetName}" with ${rawRows.length} total rows.`);

  const normalizedRows = [];

  for (const row of rawRows) {
    const keys = Object.keys(row);

    const findVal = (patterns) => {
      for (const p of patterns) {
        const foundKey = keys.find(k => {
          const normK = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const normP = p.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normK === normP || normK.includes(normP);
        });
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
          return row[foundKey];
        }
      }
      return '';
    };

    const rollNo = cleanString(findVal(['rollno', 'rollnumber', 'studentid', 'roll', 'regno', 'registrationno', 'id', 'cmsid', 'student_id']));
    let roomVal = cleanString(findVal(['room', 'roomno', 'roomnumber', 'roomname', 'room#', 'allottedroom', 'room_name', 'rooms']));
    const capacityVal = cleanString(findVal(['capacity', 'roomcapacity', 'cap', 'beds', 'bedsperroom', 'bedcapacity', 'totalbeds']));
    const cnicVal = cleanString(findVal(['cnic', 'cnicno', 'nic', 'cnicnumber', 'nationalid', 'idcard', 'cnic_no', 'bform']));
    const domicileVal = cleanString(findVal(['domicile', 'district', 'city', 'domiciledistrict', 'homedistrict']));
    const nameVal = cleanString(findVal(['name', 'studentname', 'fullname', 'student_name']));

    if (!isValidRoomName(roomVal)) {
      roomVal = '';
    }

    if (!rollNo && !roomVal && !nameVal) {
      // Empty row
      continue;
    }

    normalizedRows.push({
      rollNo,
      roomName: roomVal,
      capacity: capacityVal && !isNaN(Number(capacityVal)) ? Number(capacityVal) : undefined,
      cnic: cnicVal,
      domicile: domicileVal,
      name: nameVal,
    });
  }

  return normalizedRows;
}

export async function runAllocation(filePath = DEFAULT_FILE_PATH, hostelId = HOSTEL_ID) {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in backend/.env');
  }

  console.log(`\n======================================================`);
  console.log(`  STARTING HOSTEL ALLOCATION & IMPORT`);
  console.log(`  Hostel ID  : ${hostelId}`);
  console.log(`  Excel Path : ${filePath}`);
  console.log(`======================================================\n`);

  const records = readExcelFile(filePath);

  if (records.length === 0) {
    console.log('No valid data rows found in Excel.');
    return;
  }

  console.log(`Parsed ${records.length} valid student rows.\n`);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  try {
    const hostelObjectId = new mongoose.Types.ObjectId(hostelId);

    // ==========================================
    // STEP 1: Compute Room Capacities & Create Rooms
    // ==========================================
    console.log('--- STEP 1: Creating/Verifying Rooms with Capacity ---');
    
    // Group records by room to calculate required capacity
    const roomCapacities = new Map();

    for (const rec of records) {
      if (!rec.roomName) continue;
      const rName = rec.roomName;
      const cur = roomCapacities.get(rName) || { explicit: 0, count: 0 };
      
      if (rec.capacity && rec.capacity > 0) {
        cur.explicit = Math.max(cur.explicit, rec.capacity);
      }
      cur.count += 1;
      roomCapacities.set(rName, cur);
    }

    const roomDocsMap = new Map(); // roomName -> Room Document

    for (const [rName, capInfo] of roomCapacities.entries()) {
      // Room capacity priority: explicit capacity from column > total students in room > min 1
      const targetCapacity = capInfo.explicit > 0 ? capInfo.explicit : Math.max(1, capInfo.count);

      let room = await Room.findOne({
        hostelId: hostelObjectId,
        roomName: rName,
      });

      if (!room) {
        room = await Room.create({
          hostelId: hostelObjectId,
          roomName: rName,
          capacity: targetCapacity,
          occupants: 0,
          status: 'Available',
        });
        console.log(`  ✓ [Created Room] "${rName}" (Capacity: ${room.capacity})`);
      } else {
        // Upgrade capacity if Excel demands more beds than currently set
        if (room.capacity < targetCapacity) {
          const oldCap = room.capacity;
          room.capacity = targetCapacity;
          await room.save();
          console.log(`  ↑ [Updated Room Capacity] "${rName}" (${oldCap} -> ${room.capacity})`);
        } else {
          console.log(`  ℹ [Existing Room] "${rName}" (Capacity: ${room.capacity})`);
        }
      }
      roomDocsMap.set(rName, room);
    }

    // ==========================================
    // STEP 2 & 3: Lookup Students, Update CNIC/Domicile, Allot Rooms
    // ==========================================
    console.log('\n--- STEP 2 & 3: Updating Additional Info & Allotting Rooms ---');

    let updatedStudents = 0;
    let allottedStudents = 0;
    let notFoundStudents = 0;
    const missingList = [];
    const errorList = [];

    for (const rec of records) {
      try {
        const rollNoClean = rec.rollNo.trim().toLowerCase();
        
        if (!rollNoClean) {
          console.log(`  ⚠ [Skipped Row] Missing Roll Number (Name: ${rec.name || 'Unknown'})`);
          continue;
        }

        // Search student across multiple criteria for 100% match rate
        let student = await User.findOne({
          $and: [
            {
              $or: [
                { hostelId: hostelId },
                { hostelId: hostelObjectId.toString() }
              ]
            },
            {
              $or: [
                { id: rollNoClean },
                { id: rec.rollNo.trim() },
                { id: new RegExp(`^${rollNoClean}$`, 'i') },
                { email: new RegExp(`^${rollNoClean}@`, 'i') },
              ]
            }
          ]
        });

        // Fallback: If not found by roll number, try searching by exact student name if provided
        if (!student && rec.name && rec.name.trim().length > 3) {
          student = await User.findOne({
            hostelId: { $in: [hostelId, hostelObjectId.toString()] },
            name: new RegExp(`^${rec.name.trim()}$`, 'i')
          });
        }

        if (!student) {
          missingList.push({
            rollNo: rec.rollNo,
            name: rec.name || '',
            roomName: rec.roomName || '',
            capacity: rec.capacity || '',
            cnic: rec.cnic || '',
            domicile: rec.domicile || '',
          });
          notFoundStudents++;
          console.log(`  ✗ [User Not in DB -> Added to Missing List] Roll: "${rec.rollNo}" | Name: "${rec.name || 'N/A'}" | Room: "${rec.roomName || 'N/A'}"`);
          continue;
        }

        // 1. Update CNIC and Domicile in additionalInfo
        const infoUpdates = {};
        if (rec.cnic) infoUpdates['CNIC'] = rec.cnic;
        if (rec.domicile) infoUpdates['Domicile'] = rec.domicile;

        student.additionalInfo = updateAdditionalInfo(student.additionalInfo, infoUpdates);

        // 2. Allot to Room if specified
        let allotmentStatusText = 'No Room in Excel';
        if (rec.roomName && roomDocsMap.has(rec.roomName)) {
          const targetRoom = roomDocsMap.get(rec.roomName);
          student.room = targetRoom._id;
          allottedStudents++;
          allotmentStatusText = `Allotted to Room "${rec.roomName}"`;
        }

        await student.save();
        updatedStudents++;

        console.log(`  ✓ [Success] ${student.name} (${student.id}) -> ${allotmentStatusText} | CNIC: ${rec.cnic || 'N/A'} | Domicile: ${rec.domicile || 'N/A'}`);

      } catch (err) {
        console.error(`  ✗ [Error on ${rec.rollNo}]:`, err.message);
        errorList.push({ rollNo: rec.rollNo, error: err.message });
      }
    }

    // ==========================================
    // STEP 4: Recalculate Occupancy and Status for All Hostel Rooms
    // ==========================================
    console.log('\n--- STEP 4: Recalculating Room Occupancies & Availability ---');
    
    // Fetch all rooms for this hostel
    const allHostelRooms = await Room.find({ hostelId: hostelObjectId });

    for (const roomDoc of allHostelRooms) {
      const occupantCount = await User.countDocuments({
        room: roomDoc._id,
        hostelId: { $in: [hostelId, hostelObjectId.toString()] }
      });

      roomDoc.occupants = occupantCount;
      // Auto-set status: Full if capacity reached, else Available
      if (roomDoc.status !== 'Maintenance') {
        roomDoc.status = occupantCount >= roomDoc.capacity ? 'Full' : 'Available';
      }
      await roomDoc.save();

      console.log(`  Room "${roomDoc.roomName}": ${roomDoc.occupants}/${roomDoc.capacity} beds occupied (Status: ${roomDoc.status})`);
    }

    // Save missing students to JSON and CSV for later processing
    if (missingList.length > 0) {
      const missingJsonPath = path.join(__dirname, 'missing-students.json');
      const missingCsvPath = path.join(__dirname, 'missing-students.csv');

      fs.writeFileSync(missingJsonPath, JSON.stringify(missingList, null, 2), 'utf8');

      const csvHeader = 'rollNo,name,roomName,capacity,cnic,domicile\n';
      const csvLines = missingList.map(s => `"${s.rollNo}","${s.name}","${s.roomName}","${s.capacity}","${s.cnic}","${s.domicile}"`).join('\n');
      fs.writeFileSync(missingCsvPath, csvHeader + csvLines, 'utf8');

      console.log(`\n📋 Saved ${missingList.length} un-matched students to:`);
      console.log(`   - JSON: ${missingJsonPath}`);
      console.log(`   - CSV : ${missingCsvPath}`);
    }

    console.log('\n======================================================');
    console.log('               IMPORT & ALLOCATION COMPLETE');
    console.log('======================================================');
    console.log(`Total Excel Rows Processed : ${records.length}`);
    console.log(`Rooms Created / Verified   : ${roomDocsMap.size}`);
    console.log(`Students Updated           : ${updatedStudents}`);
    console.log(`Students Allotted Rooms    : ${allottedStudents}`);
    console.log(`Students Not Found in DB   : ${notFoundStudents}`);
    if (errorList.length > 0) {
      console.log(`Errors Encountered         : ${errorList.length}`);
    }
    console.log('======================================================\n');

  } catch (error) {
    console.error('Fatal execution error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// Run CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePathArg = process.argv[2] || DEFAULT_FILE_PATH;
  runAllocation(filePathArg, HOSTEL_ID).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });
}
